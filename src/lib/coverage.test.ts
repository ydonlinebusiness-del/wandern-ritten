import { describe, it, expect } from "vitest";
import type { LineString } from "geojson";
import { computeCoverage, isTrailCovered, type TrailRef } from "./coverage";

// Ein gerader Weg entlang eines Breitengrads (ca. 0.01° ~ 770 m bei 46.5° lng-Schritt klein).
const trailA: TrailRef = {
  osmId: "way/1",
  geometry: {
    type: "LineString",
    coordinates: [
      [11.40, 46.50],
      [11.40, 46.505],
      [11.40, 46.51],
    ],
  } as LineString,
};

const trailB: TrailRef = {
  osmId: "way/2",
  geometry: {
    type: "LineString",
    coordinates: [
      [11.50, 46.60],
      [11.50, 46.61],
    ],
  } as LineString,
};

describe("computeCoverage", () => {
  it("zählt einen exakt nachgelaufenen Weg als (nahezu) vollständig", () => {
    const track: LineString = {
      type: "LineString",
      coordinates: [
        [11.40, 46.50],
        [11.40, 46.51],
      ],
    };
    const result = computeCoverage([trailA], [track], 25);
    expect(result.coveredTrailIds).toContain("way/1");
    expect(result.coveredPct).toBeGreaterThan(90);
  });

  it("zählt einen weit entfernten Track nicht", () => {
    const track: LineString = {
      type: "LineString",
      coordinates: [
        [11.40, 46.50],
        [11.40, 46.51],
      ],
    };
    const result = computeCoverage([trailB], [track], 25);
    expect(result.coveredPct).toBe(0);
    expect(result.coveredTrailIds).toHaveLength(0);
  });

  it("berechnet Gesamt-% über mehrere Wege (einer gelaufen, einer nicht)", () => {
    const track: LineString = {
      type: "LineString",
      coordinates: [
        [11.40, 46.50],
        [11.40, 46.51],
      ],
    };
    const result = computeCoverage([trailA, trailB], [track], 25);
    expect(result.coveredPct).toBeGreaterThan(0);
    expect(result.coveredPct).toBeLessThan(100);
    expect(result.coveredTrailIds).toEqual(["way/1"]);
  });

  it("berücksichtigt den Puffer (großer Puffer deckt parallelen Track)", () => {
    // Track ~ 70 m östlich versetzt (0.001° lng ~ 76 m bei 46.5°)
    const offsetTrack: LineString = {
      type: "LineString",
      coordinates: [
        [11.401, 46.50],
        [11.401, 46.51],
      ],
    };
    expect(isTrailCovered(trailA, [offsetTrack], 25)).toBe(false);
    expect(isTrailCovered(trailA, [offsetTrack], 200)).toBe(true);
  });
});
