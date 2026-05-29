import type { LineString } from "geojson";

/** Tour-Daten für die Kartendarstellung. */
export interface MapActivity {
  id: number;
  name: string;
  source: "strava" | "gpx";
  /** [lat, lng, ele?] */
  track: [number, number, number?][];
}

export interface MapTrail {
  osmId: string;
  name: string | null;
  ref: string | null;
  geometry: LineString; // [lng, lat]
}

export interface MapPoi {
  id: number;
  name: string;
  type: string;
  lat: number;
  lng: number;
  elevationM?: number | null;
  description?: string | null;
}

export interface MapPlannedRoute {
  id: number;
  name: string;
  geometry: LineString; // [lng, lat]
}

export interface MapLayersState {
  activities: boolean;
  heatmap: boolean;
  trails: boolean;
  pois: boolean;
  planned: boolean;
}
