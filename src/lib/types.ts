import type { LineString } from "geojson";

/** Ein Trackpunkt: [lat, lng, ele?] – ele in Metern. */
export type TrackPoint = [number, number, number?];

/** GeoJSON-LineString in [lng, lat]-Reihenfolge (GeoJSON-Standard). */
export type Track = LineString;

export type ActivitySource = "strava" | "gpx";

export interface BBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface ActivityStats {
  count: number;
  totalDistanceM: number;
  totalElevGainM: number;
  totalMovingTimeS: number;
  longestM: number;
  highestM: number;
}

export interface ElevationPoint {
  /** Aufsummierte Distanz vom Start in Metern. */
  distM: number;
  /** Höhe in Metern. */
  eleM: number;
}

/** Ergebnis der Erkundungs-/Coverage-Berechnung. */
export interface CoverageResult {
  totalTrailLengthM: number;
  coveredLengthM: number;
  coveredPct: number;
  /** OSM-IDs der (teilweise) erledigten Wege. */
  coveredTrailIds: string[];
}
