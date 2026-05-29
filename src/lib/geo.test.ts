import { describe, it, expect } from "vitest";
import polyline from "@mapbox/polyline";
import {
  decodeStravaPolyline,
  trackToLineString,
  lineStringToTrack,
  trackTouchesArea,
  trackBBox,
  bboxIntersects,
  elevationGainM,
  maxElevationM,
  elevationProfile,
  trackLengthM,
} from "./geo";
import { RITTEN_BBOX } from "./config";
import type { TrackPoint } from "./types";

describe("decodeStravaPolyline", () => {
  it("dekodiert eine encoded polyline zu [lat,lng]", () => {
    const encoded = polyline.encode([
      [46.54, 11.47],
      [46.55, 11.48],
    ]);
    const pts = decodeStravaPolyline(encoded);
    expect(pts).toHaveLength(2);
    expect(pts[0][0]).toBeCloseTo(46.54, 4);
    expect(pts[0][1]).toBeCloseTo(11.47, 4);
  });

  it("liefert leeres Array bei leerem Input", () => {
    expect(decodeStravaPolyline("")).toEqual([]);
  });
});

describe("trackToLineString / lineStringToTrack", () => {
  it("dreht lat/lng korrekt für GeoJSON ([lng,lat]) und zurück", () => {
    const pts: TrackPoint[] = [
      [46.54, 11.47],
      [46.55, 11.48],
    ];
    const line = trackToLineString(pts);
    expect(line.coordinates[0]).toEqual([11.47, 46.54]);
    const back = lineStringToTrack(line);
    expect(back).toEqual(pts);
  });
});

describe("trackTouchesArea (Ritten-BBox)", () => {
  it("erkennt einen Punkt am Ritten als relevant", () => {
    const pts: TrackPoint[] = [[46.54, 11.47]];
    expect(trackTouchesArea(pts, RITTEN_BBOX)).toBe(true);
  });

  it("verwirft eine Tour außerhalb (z. B. München)", () => {
    const pts: TrackPoint[] = [[48.137, 11.575]];
    expect(trackTouchesArea(pts, RITTEN_BBOX)).toBe(false);
  });

  it("akzeptiert Tour, die das Gebiet nur teilweise berührt", () => {
    const pts: TrackPoint[] = [
      [48.0, 11.47], // außerhalb
      [46.55, 11.48], // am Ritten
    ];
    expect(trackTouchesArea(pts, RITTEN_BBOX)).toBe(true);
  });
});

describe("trackBBox / bboxIntersects", () => {
  it("berechnet BBox und erkennt Überschneidung", () => {
    const pts: TrackPoint[] = [
      [46.5, 11.4],
      [46.6, 11.5],
    ];
    const box = trackBBox(pts)!;
    expect(box.minLat).toBeCloseTo(46.5);
    expect(box.maxLng).toBeCloseTo(11.5);
    expect(bboxIntersects(box, RITTEN_BBOX)).toBe(true);
  });
});

describe("elevationGainM", () => {
  it("summiert nur signifikante Anstiege (mit Threshold)", () => {
    const pts: TrackPoint[] = [
      [46.5, 11.4, 1000],
      [46.5, 11.4, 1001], // unter Threshold → ignoriert
      [46.5, 11.4, 1010], // +10 ab 1000
      [46.5, 11.4, 1005], // Abstieg
      [46.5, 11.4, 1015], // +10 ab 1005
    ];
    expect(elevationGainM(pts, 3)).toBe(20);
  });

  it("ignoriert fehlende Höhen", () => {
    const pts: TrackPoint[] = [[46.5, 11.4], [46.5, 11.4]];
    expect(elevationGainM(pts)).toBe(0);
  });
});

describe("maxElevationM", () => {
  it("findet den höchsten Punkt", () => {
    const pts: TrackPoint[] = [
      [46.5, 11.4, 1000],
      [46.5, 11.4, 2260],
      [46.5, 11.4, 1500],
    ];
    expect(maxElevationM(pts)).toBe(2260);
  });
});

describe("elevationProfile", () => {
  it("erzeugt aufsteigende Distanzen und passende Höhen", () => {
    const pts: TrackPoint[] = [
      [46.5, 11.4, 1000],
      [46.51, 11.4, 1100],
      [46.52, 11.4, 1200],
    ];
    const profile = elevationProfile(pts);
    expect(profile).toHaveLength(3);
    expect(profile[0].distM).toBe(0);
    expect(profile[1].distM).toBeGreaterThan(0);
    expect(profile[2].distM).toBeGreaterThan(profile[1].distM);
    expect(profile[2].eleM).toBe(1200);
  });

  it("downsampled lange Tracks auf maxPoints", () => {
    const pts: TrackPoint[] = Array.from(
      { length: 5000 },
      (_, i) => [46.5 + i * 0.0001, 11.4, 1000 + i] as TrackPoint,
    );
    const profile = elevationProfile(pts, 300);
    expect(profile.length).toBeLessThanOrEqual(301);
  });
});

describe("trackLengthM", () => {
  it("misst eine bekannte Distanz grob korrekt", () => {
    // ~1 Breitengrad-Minute ~ 1.85 km; hier 0.01° ~ 1.11 km
    const pts: TrackPoint[] = [
      [46.5, 11.4],
      [46.51, 11.4],
    ];
    const m = trackLengthM(pts);
    expect(m).toBeGreaterThan(1000);
    expect(m).toBeLessThan(1200);
  });
});
