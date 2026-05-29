import type { LineString } from "geojson";
import { RITTEN_BBOX } from "./config";
import { lineLengthM } from "./geo";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export interface OverpassWay {
  type: "way";
  id: number;
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements: OverpassWay[];
}

export interface ParsedTrail {
  osmId: string;
  name: string | null;
  ref: string | null;
  sacScale: string | null;
  geometry: LineString;
  lengthM: number;
}

/** Overpass-Query für das fußläufige Wegenetz im Rittner Gebiet. */
export function buildOverpassQuery(): string {
  const { minLat, minLng, maxLat, maxLng } = RITTEN_BBOX;
  const bbox = `${minLat},${minLng},${maxLat},${maxLng}`;
  return `[out:json][timeout:90];
(
  way["highway"~"^(path|footway|track|steps|bridleway)$"](${bbox});
);
out geom;`;
}

/** Wandelt eine Overpass-Antwort in Trail-Datensätze um (Ways mit Geometrie). */
export function parseOverpass(data: OverpassResponse): ParsedTrail[] {
  const trails: ParsedTrail[] = [];
  for (const el of data.elements) {
    if (el.type !== "way" || !el.geometry || el.geometry.length < 2) continue;
    const geometry: LineString = {
      type: "LineString",
      coordinates: el.geometry.map((g) => [g.lon, g.lat]),
    };
    trails.push({
      osmId: `way/${el.id}`,
      name: el.tags?.name ?? null,
      ref: el.tags?.ref ?? el.tags?.["osmc:symbol"] ?? null,
      sacScale: el.tags?.sac_scale ?? null,
      geometry,
      lengthM: Math.round(lineLengthM(geometry)),
    });
  }
  return trails;
}

/** Lädt das Wegenetz von Overpass und parst es. */
export async function fetchTrails(): Promise<ParsedTrail[]> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(buildOverpassQuery())}`,
  });
  if (!res.ok) throw new Error(`Overpass-Fehler ${res.status}`);
  const data = (await res.json()) as OverpassResponse;
  return parseOverpass(data);
}
