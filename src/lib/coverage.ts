import { pointToLineDistance, lineString, point, length } from "@turf/turf";
import type { LineString } from "geojson";
import type { CoverageResult } from "./types";
import { COVERAGE_BUFFER_M } from "./config";

export interface TrailRef {
  osmId: string;
  geometry: LineString; // [lng, lat]
}

/**
 * Berechnet den Erkundungs-Fortschritt: Welcher Anteil des offiziellen Wegenetzes
 * wurde bereits begangen?
 *
 * Vorgehen: Jeder Weg wird in seine Segmente zerlegt. Ein Segment gilt als
 * "begangen", wenn sein Mittelpunkt innerhalb von `bufferM` Metern zu mindestens
 * einer gelaufenen Spur liegt. Der abgedeckte Anteil = Summe begangener
 * Segmentlängen / Gesamtlänge.
 *
 * @param trails       Offizielles Wegenetz (Referenz).
 * @param walkedTracks Gelaufene Spuren als LineStrings ([lng,lat]).
 * @param bufferM      Toleranz in Metern.
 */
export function computeCoverage(
  trails: TrailRef[],
  walkedTracks: LineString[],
  bufferM = COVERAGE_BUFFER_M,
): CoverageResult {
  let totalTrailLengthM = 0;
  let coveredLengthM = 0;
  const coveredTrailIds = new Set<string>();

  const trackLines = walkedTracks
    .filter((t) => t.coordinates.length >= 2)
    .map((t) => lineString(t.coordinates));

  for (const trail of trails) {
    const coords = trail.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const a = coords[i];
      const b = coords[i + 1];
      const segLenM = length(lineString([a, b]), { units: "meters" });
      totalTrailLengthM += segLenM;

      const mid = point([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      let covered = false;
      for (const track of trackLines) {
        const dist = pointToLineDistance(mid, track, { units: "meters" });
        if (dist <= bufferM) {
          covered = true;
          break;
        }
      }
      if (covered) {
        coveredLengthM += segLenM;
        coveredTrailIds.add(trail.osmId);
      }
    }
  }

  const coveredPct =
    totalTrailLengthM > 0 ? (coveredLengthM / totalTrailLengthM) * 100 : 0;

  return {
    totalTrailLengthM: Math.round(totalTrailLengthM),
    coveredLengthM: Math.round(coveredLengthM),
    coveredPct: Math.round(coveredPct * 10) / 10,
    coveredTrailIds: [...coveredTrailIds],
  };
}

/** Prüft für einen einzelnen Weg, ob er (teilweise) begangen wurde. */
export function isTrailCovered(
  trail: TrailRef,
  walkedTracks: LineString[],
  bufferM = COVERAGE_BUFFER_M,
): boolean {
  return computeCoverage([trail], walkedTracks, bufferM).coveredLengthM > 0;
}
