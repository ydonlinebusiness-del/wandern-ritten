import { describe, it, expect } from "vitest";
import { buildOverpassQuery, parseOverpass, type OverpassResponse } from "./overpass";

describe("buildOverpassQuery", () => {
  it("enthält die Ritten-BBox und Weg-Filter", () => {
    const q = buildOverpassQuery();
    expect(q).toContain("46.49,11.38,46.63,11.56");
    expect(q).toContain("path|footway|track|steps|bridleway");
    expect(q).toContain("out geom;");
  });
});

describe("parseOverpass", () => {
  it("wandelt Ways mit Geometrie in Trails ([lng,lat]) um", () => {
    const data: OverpassResponse = {
      elements: [
        {
          type: "way",
          id: 42,
          tags: { name: "Freud-Promenade", sac_scale: "hiking", ref: "1" },
          geometry: [
            { lat: 46.52, lon: 11.41 },
            { lat: 46.53, lon: 11.42 },
          ],
        },
        // wird verworfen (zu wenig Punkte)
        { type: "way", id: 7, geometry: [{ lat: 46.5, lon: 11.4 }] },
      ],
    };
    const trails = parseOverpass(data);
    expect(trails).toHaveLength(1);
    expect(trails[0].osmId).toBe("way/42");
    expect(trails[0].name).toBe("Freud-Promenade");
    expect(trails[0].sacScale).toBe("hiking");
    expect(trails[0].geometry.coordinates[0]).toEqual([11.41, 46.52]);
    expect(trails[0].lengthM).toBeGreaterThan(0);
  });
});
