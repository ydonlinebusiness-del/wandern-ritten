import type { ActivityStats } from "./types";

export interface StatActivity {
  distanceM: number;
  elevGainM: number;
  movingTimeS: number;
  maxElevationM: number | null;
  startDate: string | Date | null;
}

/** Aggregiert Gesamtstatistiken über alle Touren. */
export function summarize(activities: StatActivity[]): ActivityStats {
  const stats: ActivityStats = {
    count: activities.length,
    totalDistanceM: 0,
    totalElevGainM: 0,
    totalMovingTimeS: 0,
    longestM: 0,
    highestM: 0,
  };
  for (const a of activities) {
    stats.totalDistanceM += a.distanceM ?? 0;
    stats.totalElevGainM += a.elevGainM ?? 0;
    stats.totalMovingTimeS += a.movingTimeS ?? 0;
    if ((a.distanceM ?? 0) > stats.longestM) stats.longestM = a.distanceM;
    if ((a.maxElevationM ?? 0) > stats.highestM) {
      stats.highestM = a.maxElevationM ?? 0;
    }
  }
  return stats;
}

/** Gruppiert Distanz (km) und Anzahl nach Jahr. */
export function byYear(
  activities: StatActivity[],
): Array<{ year: number; distanceKm: number; count: number }> {
  const map = new Map<number, { distanceKm: number; count: number }>();
  for (const a of activities) {
    if (!a.startDate) continue;
    const year = new Date(a.startDate).getFullYear();
    const entry = map.get(year) ?? { distanceKm: 0, count: 0 };
    entry.distanceKm += (a.distanceM ?? 0) / 1000;
    entry.count += 1;
    map.set(year, entry);
  }
  return [...map.entries()]
    .map(([year, v]) => ({
      year,
      distanceKm: Math.round(v.distanceKm * 10) / 10,
      count: v.count,
    }))
    .sort((a, b) => a.year - b.year);
}

/** Gruppiert Distanz (km) nach Monat (1–12) – aggregiert über alle Jahre. */
export function byMonth(
  activities: StatActivity[],
): Array<{ month: number; distanceKm: number; count: number }> {
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    distanceKm: 0,
    count: 0,
  }));
  for (const a of activities) {
    if (!a.startDate) continue;
    const m = new Date(a.startDate).getMonth();
    months[m].distanceKm += (a.distanceM ?? 0) / 1000;
    months[m].count += 1;
  }
  return months.map((m) => ({
    ...m,
    distanceKm: Math.round(m.distanceKm * 10) / 10,
  }));
}

// ── Formatierungs-Helfer (für die UI) ──────────────────────────────────────

export function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} hm`;
}
