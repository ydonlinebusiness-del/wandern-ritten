import { NextResponse } from "next/server";
import { RITTEN_BBOX } from "@/lib/config";
import {
  decodeStravaPolyline,
  elevationGainM,
  maxElevationM,
  trackBBox,
  trackToLineString,
  trackTouchesArea,
} from "@/lib/geo";
import {
  fetchActivities,
  fetchAltitudeStream,
  getValidAccessToken,
} from "@/lib/strava";
import { insertActivity, stravaActivityExists } from "@/db/repo";
import type { TrackPoint } from "@/lib/types";

export const maxDuration = 60;

/**
 * Synchronisiert Strava-Aktivitäten ins lokale System.
 * - holt Aktivitäten seitenweise
 * - filtert auf das Rittner Gebiet (BBox)
 * - dekodiert die Polyline, lädt optional den Höhen-Stream
 * - überspringt bereits importierte Aktivitäten
 */
export async function POST(req: Request) {
  let token: string | null;
  try {
    token = await getValidAccessToken();
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json(
      { error: "Strava ist nicht verbunden." },
      { status: 400 },
    );
  }

  const url = new URL(req.url);
  const maxPages = Math.min(Number(url.searchParams.get("pages") ?? 4), 10);

  let imported = 0;
  let skipped = 0;
  let scanned = 0;

  for (let page = 1; page <= maxPages; page++) {
    const summaries = await fetchActivities(token, page, 50);
    if (summaries.length === 0) break;

    for (const s of summaries) {
      scanned++;
      const stravaId = String(s.id);
      if (await stravaActivityExists(stravaId)) {
        skipped++;
        continue;
      }

      const encoded = s.map?.summary_polyline;
      if (!encoded) {
        skipped++;
        continue;
      }
      let points: TrackPoint[] = decodeStravaPolyline(encoded);
      if (!trackTouchesArea(points, RITTEN_BBOX)) {
        skipped++;
        continue;
      }

      // Höhen-Stream laden (genauer als summary), Fehler ignorieren.
      try {
        const stream = await fetchAltitudeStream(token, s.id);
        if (stream.latlng && stream.altitude) {
          points = stream.latlng.map(
            ([lat, lng], i) => [lat, lng, stream.altitude![i]] as TrackPoint,
          );
        }
      } catch {
        // Stream optional
      }

      const box = trackBBox(points);
      await insertActivity({
        source: "strava",
        stravaId,
        name: s.name,
        type: s.sport_type || s.type || "Hike",
        startDate: s.start_date ? new Date(s.start_date) : null,
        distanceM: s.distance ?? 0,
        elevGainM: s.total_elevation_gain || elevationGainM(points),
        movingTimeS: s.moving_time ?? 0,
        elapsedTimeS: s.elapsed_time ?? 0,
        maxElevationM: s.elev_high ?? maxElevationM(points) ?? undefined,
        geometry: trackToLineString(points),
        track: points,
        bbox: box ? [box.minLng, box.minLat, box.maxLng, box.maxLat] : undefined,
      });
      imported++;
    }
  }

  return NextResponse.json({ imported, skipped, scanned });
}
