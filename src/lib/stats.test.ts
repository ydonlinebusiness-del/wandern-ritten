import { describe, it, expect } from "vitest";
import { summarize, byYear, byMonth, formatDistance, formatDuration } from "./stats";
import type { StatActivity } from "./stats";

const acts: StatActivity[] = [
  { distanceM: 5000, elevGainM: 300, movingTimeS: 3600, maxElevationM: 1500, startDate: "2023-07-15T08:00:00Z" },
  { distanceM: 12000, elevGainM: 900, movingTimeS: 9000, maxElevationM: 2260, startDate: "2024-08-02T07:00:00Z" },
  { distanceM: 8000, elevGainM: 500, movingTimeS: 5400, maxElevationM: 1800, startDate: "2024-08-20T09:00:00Z" },
];

describe("summarize", () => {
  it("summiert Distanz, Höhenmeter, Zeit und findet Maxima", () => {
    const s = summarize(acts);
    expect(s.count).toBe(3);
    expect(s.totalDistanceM).toBe(25000);
    expect(s.totalElevGainM).toBe(1700);
    expect(s.totalMovingTimeS).toBe(18000);
    expect(s.longestM).toBe(12000);
    expect(s.highestM).toBe(2260);
  });

  it("liefert Nullwerte bei leerer Liste", () => {
    expect(summarize([]).count).toBe(0);
  });
});

describe("byYear", () => {
  it("gruppiert nach Jahr und sortiert aufsteigend", () => {
    const years = byYear(acts);
    expect(years).toHaveLength(2);
    expect(years[0].year).toBe(2023);
    expect(years[1].year).toBe(2024);
    expect(years[1].count).toBe(2);
    expect(years[1].distanceKm).toBe(20);
  });
});

describe("byMonth", () => {
  it("liefert 12 Monate; August summiert beide 2024-Touren", () => {
    const months = byMonth(acts);
    expect(months).toHaveLength(12);
    expect(months[7].distanceKm).toBe(20); // August (Index 7)
    expect(months[6].distanceKm).toBe(5); // Juli
  });
});

describe("Formatierung", () => {
  it("formatiert Distanz und Dauer", () => {
    expect(formatDistance(5400)).toBe("5.4 km");
    expect(formatDistance(800)).toBe("800 m");
    expect(formatDuration(3660)).toBe("1 h 1 min");
    expect(formatDuration(1800)).toBe("30 min");
  });
});
