import { gpx } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import type { Feature, FeatureCollection, LineString } from "geojson";
import type { TrackPoint } from "./types";

export interface ParsedGpx {
  name: string | null;
  /** [lat, lng, ele?] */
  points: TrackPoint[];
  /** ISO-Startzeit, falls vorhanden. */
  startTime: string | null;
}

/**
 * Parst GPX-Text zu Track-Punkten. Verbindet Track-Segmente und Routen zu einer
 * Punktliste. togeojson liefert Koordinaten als [lng, lat, ele].
 */
export function parseGpx(xml: string): ParsedGpx {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  // @tmcw/togeojson erwartet ein DOM-Document; @xmldom ist kompatibel genug.
  const geojson = gpx(doc as unknown as Document) as FeatureCollection;

  const points: TrackPoint[] = [];
  let name: string | null = null;
  let startTime: string | null = null;

  for (const feature of geojson.features as Feature[]) {
    if (!name && typeof feature.properties?.name === "string") {
      name = feature.properties.name;
    }
    // togeojson legt Zeiten je nach Version unter coordinateProperties.times
    // oder coordTimes ab.
    const coordProps = feature.properties?.coordinateProperties as
      | { times?: string[] | string[][] }
      | undefined;
    const times =
      (coordProps?.times as string[] | undefined) ??
      (feature.properties?.coordTimes as string[] | undefined);
    if (!startTime && Array.isArray(times) && times.length > 0) {
      const first = times[0];
      startTime = Array.isArray(first) ? first[0] : first;
    }
    if (feature.geometry?.type === "LineString") {
      appendLine(points, feature.geometry);
    } else if (feature.geometry?.type === "MultiLineString") {
      for (const line of feature.geometry.coordinates) {
        appendLine(points, { type: "LineString", coordinates: line });
      }
    }
  }

  return { name, points, startTime };
}

function appendLine(out: TrackPoint[], line: LineString) {
  for (const coord of line.coordinates) {
    const [lng, lat, ele] = coord;
    out.push(ele == null ? [lat, lng] : [lat, lng, ele]);
  }
}
