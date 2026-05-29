import polyline from "@mapbox/polyline";
import { length, bbox, lineString, point } from "@turf/turf";
import type { Feature, LineString, Position } from "geojson";
import type { BBox, ElevationPoint, TrackPoint } from "./types";

/**
 * Dekodiert eine Strava-Polyline (Encoded Polyline Algorithm) zu Track-Punkten.
 * Strava liefert [lat, lng] – wir behalten diese Reihenfolge in TrackPoint bei.
 */
export function decodeStravaPolyline(encoded: string): TrackPoint[] {
  if (!encoded) return [];
  // polyline.decode liefert [lat, lng][]
  return polyline.decode(encoded).map(([lat, lng]) => [lat, lng] as TrackPoint);
}

/** Wandelt Track-Punkte ([lat,lng,ele]) in einen GeoJSON-LineString ([lng,lat]) um. */
export function trackToLineString(points: TrackPoint[]): LineString {
  return {
    type: "LineString",
    coordinates: points.map(([lat, lng]) => [lng, lat] as Position),
  };
}

/** GeoJSON-LineString ([lng,lat]) zurück zu Track-Punkten ([lat,lng]). */
export function lineStringToTrack(line: LineString): TrackPoint[] {
  return line.coordinates.map(([lng, lat]) => [lat, lng] as TrackPoint);
}

/** Berechnet die Bounding-Box einer Punktliste. */
export function trackBBox(points: TrackPoint[]): BBox | null {
  if (points.length === 0) return null;
  const line = trackToLineString(points);
  const [minLng, minLat, maxLng, maxLat] = bbox(line);
  return { minLng, minLat, maxLng, maxLat };
}

/** Prüft, ob sich zwei Bounding-Boxen überschneiden. */
export function bboxIntersects(a: BBox, b: BBox): boolean {
  return (
    a.minLng <= b.maxLng &&
    a.maxLng >= b.minLng &&
    a.minLat <= b.maxLat &&
    a.maxLat >= b.minLat
  );
}

/**
 * Prüft, ob ein Track relevant fürs Rittner Gebiet ist: mind. ein Punkt
 * liegt innerhalb der Gebiets-BBox.
 */
export function trackTouchesArea(points: TrackPoint[], area: BBox): boolean {
  return points.some(
    ([lat, lng]) =>
      lng >= area.minLng &&
      lng <= area.maxLng &&
      lat >= area.minLat &&
      lat <= area.maxLat,
  );
}

/** Gesamtlänge eines LineStrings in Metern. */
export function lineLengthM(line: LineString): number {
  if (line.coordinates.length < 2) return 0;
  return length(lineString(line.coordinates), { units: "meters" });
}

/** Gesamtlänge einer Track-Punktliste in Metern. */
export function trackLengthM(points: TrackPoint[]): number {
  if (points.length < 2) return 0;
  return lineLengthM(trackToLineString(points));
}

/**
 * Positive Höhenmeter (kumulierter Anstieg) eines Tracks.
 * Kleine Schwankungen werden über `threshold` (Meter) geglättet.
 */
export function elevationGainM(points: TrackPoint[], threshold = 3): number {
  let gain = 0;
  let lastEle: number | null = null;
  for (const [, , ele] of points) {
    if (ele == null) continue;
    if (lastEle == null) {
      lastEle = ele;
      continue;
    }
    const diff = ele - lastEle;
    if (diff >= threshold) {
      gain += diff;
      lastEle = ele;
    } else if (diff <= -threshold) {
      lastEle = ele;
    }
  }
  return Math.round(gain);
}

/** Maximale Höhe eines Tracks in Metern (oder null). */
export function maxElevationM(points: TrackPoint[]): number | null {
  let max: number | null = null;
  for (const [, , ele] of points) {
    if (ele == null) continue;
    if (max == null || ele > max) max = ele;
  }
  return max == null ? null : Math.round(max);
}

/**
 * Erzeugt ein Höhenprofil (distanz vs. höhe) aus Track-Punkten.
 * Optional auf `maxPoints` heruntergerechnet, damit Charts performant bleiben.
 */
export function elevationProfile(
  points: TrackPoint[],
  maxPoints = 300,
): ElevationPoint[] {
  const withEle = points.filter(([, , ele]) => ele != null);
  if (withEle.length < 2) return [];

  const profile: ElevationPoint[] = [];
  let cumDist = 0;
  for (let i = 0; i < withEle.length; i++) {
    if (i > 0) {
      const seg = lineString([
        [withEle[i - 1][1], withEle[i - 1][0]],
        [withEle[i][1], withEle[i][0]],
      ]);
      cumDist += length(seg, { units: "meters" });
    }
    profile.push({ distM: Math.round(cumDist), eleM: Math.round(withEle[i][2]!) });
  }

  if (profile.length <= maxPoints) return profile;
  // gleichmäßig downsamplen
  const step = profile.length / maxPoints;
  const reduced: ElevationPoint[] = [];
  for (let i = 0; i < maxPoints; i++) {
    reduced.push(profile[Math.floor(i * step)]);
  }
  reduced.push(profile[profile.length - 1]);
  return reduced;
}

/** Hilfsfunktion: Track-Punkt zu turf-Point ([lng,lat]). */
export function toTurfPoint(p: TrackPoint): Feature {
  return point([p[1], p[0]]);
}
