import type { Feature, FeatureCollection, LineString } from "geojson";
import type { ElevationPoint, TrackPoint } from "./types";
import { elevationProfile, trackLengthM, elevationGainM } from "./geo";
// Hinweis: turf wird transitiv über ./geo genutzt.

const BROUTER_BASE = "https://brouter.de/brouter";

export interface SnappedRoute {
  /** [lat, lng, ele?] entlang echter Wege. */
  points: TrackPoint[];
  distanceM: number;
  elevGainM: number;
  elevationProfile: ElevationPoint[];
}

/**
 * Baut die BRouter-URL für eine Liste von Wegpunkten ([lat,lng]) mit Wanderprofil.
 * BRouter erwartet lonlats als "lng,lat|lng,lat|...".
 */
export function buildBrouterUrl(
  waypoints: Array<[number, number]>,
  profile = "hiking-beta",
): string {
  const lonlats = waypoints.map(([lat, lng]) => `${lng},${lat}`).join("|");
  const params = new URLSearchParams({
    lonlats,
    profile,
    alternativeidx: "0",
    format: "geojson",
  });
  return `${BROUTER_BASE}?${params.toString()}`;
}

/**
 * Wandelt eine BRouter-GeoJSON-Antwort in eine gesnappte Route um.
 * BRouter-Koordinaten sind [lng, lat, ele].
 */
export function parseBrouterResponse(geojson: FeatureCollection): SnappedRoute {
  const feature = geojson.features?.[0] as Feature | undefined;
  if (!feature || feature.geometry?.type !== "LineString") {
    return { points: [], distanceM: 0, elevGainM: 0, elevationProfile: [] };
  }
  const line = feature.geometry as LineString;
  const points: TrackPoint[] = line.coordinates.map(([lng, lat, ele]) =>
    ele == null ? [lat, lng] : [lat, lng, ele],
  );

  // BRouter liefert track-length/filtered ascend in properties, wir berechnen
  // robust selbst (Fallback wenn properties fehlen).
  const props = feature.properties ?? {};
  const distanceM =
    Number(props["track-length"]) || Math.round(trackLengthM(points));
  const elevGainM =
    Number(props["filtered ascend"]) || elevationGainM(points);

  return {
    points,
    distanceM,
    elevGainM,
    elevationProfile: elevationProfile(points),
  };
}

/** Ruft BRouter serverseitig auf (umgeht CORS) und liefert die gesnappte Route. */
export async function snapRoute(
  waypoints: Array<[number, number]>,
  profile = "hiking-beta",
): Promise<SnappedRoute> {
  const url = buildBrouterUrl(waypoints, profile);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`BRouter-Fehler ${res.status}: ${await res.text()}`);
  }
  const geojson = (await res.json()) as FeatureCollection;
  return parseBrouterResponse(geojson);
}
