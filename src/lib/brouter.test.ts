import { describe, it, expect } from "vitest";
import type { FeatureCollection } from "geojson";
import { buildBrouterUrl, parseBrouterResponse } from "./brouter";

describe("buildBrouterUrl", () => {
  it("baut lonlats in lng,lat-Reihenfolge mit Wanderprofil", () => {
    const url = buildBrouterUrl([
      [46.54, 11.47],
      [46.55, 11.48],
    ]);
    expect(url).toContain("lonlats=11.47%2C46.54%7C11.48%2C46.55");
    expect(url).toContain("profile=hiking-beta");
    expect(url).toContain("format=geojson");
  });
});

describe("parseBrouterResponse", () => {
  it("wandelt BRouter-GeoJSON ([lng,lat,ele]) in Track-Punkte ([lat,lng,ele]) um", () => {
    const fc: FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { "track-length": "1234", "filtered ascend": "56" },
          geometry: {
            type: "LineString",
            coordinates: [
              [11.47, 46.54, 1200],
              [11.48, 46.55, 1256],
            ],
          },
        },
      ],
    };
    const route = parseBrouterResponse(fc);
    expect(route.points[0]).toEqual([46.54, 11.47, 1200]);
    expect(route.distanceM).toBe(1234);
    expect(route.elevGainM).toBe(56);
    expect(route.elevationProfile.length).toBeGreaterThan(0);
  });

  it("liefert leere Route bei fehlenden Features", () => {
    const fc: FeatureCollection = { type: "FeatureCollection", features: [] };
    const route = parseBrouterResponse(fc);
    expect(route.points).toEqual([]);
    expect(route.distanceM).toBe(0);
  });
});
