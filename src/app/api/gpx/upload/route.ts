import { NextResponse } from "next/server";
import { parseGpx } from "@/lib/gpx";
import {
  elevationGainM,
  maxElevationM,
  trackBBox,
  trackLengthM,
  trackToLineString,
  trackTouchesArea,
} from "@/lib/geo";
import { RITTEN_BBOX } from "@/lib/config";
import { insertActivity } from "@/db/repo";

export const maxDuration = 60;

/** Nimmt eine oder mehrere GPX-Dateien als multipart/form-data entgegen. */
export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    const single = form.get("file");
    if (single instanceof File) files.push(single);
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "Keine GPX-Datei erhalten." }, { status: 400 });
  }

  const results: Array<{ name: string; imported: boolean; reason?: string }> = [];

  for (const file of files) {
    try {
      const xml = await file.text();
      const parsed = parseGpx(xml);
      if (parsed.points.length < 2) {
        results.push({ name: file.name, imported: false, reason: "Keine Trackpunkte" });
        continue;
      }
      if (!trackTouchesArea(parsed.points, RITTEN_BBOX)) {
        results.push({
          name: file.name,
          imported: false,
          reason: "Außerhalb des Rittner Gebiets",
        });
        continue;
      }
      const box = trackBBox(parsed.points);
      const activity = await insertActivity({
        source: "gpx",
        name: parsed.name || file.name.replace(/\.gpx$/i, ""),
        type: "Hike",
        startDate: parsed.startTime ? new Date(parsed.startTime) : null,
        distanceM: Math.round(trackLengthM(parsed.points)),
        elevGainM: elevationGainM(parsed.points),
        movingTimeS: 0,
        elapsedTimeS: 0,
        maxElevationM: maxElevationM(parsed.points) ?? undefined,
        geometry: trackToLineString(parsed.points),
        track: parsed.points,
        bbox: box ? [box.minLng, box.minLat, box.maxLng, box.maxLat] : undefined,
      });
      results.push({ name: activity.name, imported: true });
    } catch (e) {
      results.push({ name: file.name, imported: false, reason: String(e) });
    }
  }

  const imported = results.filter((r) => r.imported).length;
  return NextResponse.json({ imported, results });
}
