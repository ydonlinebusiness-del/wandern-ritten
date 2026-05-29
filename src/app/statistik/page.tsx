import { listActivities } from "@/db/repo";
import { summarize, byYear, byMonth, formatDistance, formatDuration, formatElevation } from "@/lib/stats";
import { YearChart, MonthChart } from "@/components/StatsCharts";
import CoverageCard from "@/components/CoverageCard";

export const dynamic = "force-dynamic";

function BigStat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold text-ritten-forest">{value}</div>
      <div className="text-sm text-slate-600">{label}</div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export default async function StatistikPage() {
  let activities: Awaited<ReturnType<typeof listActivities>> = [];
  let error = false;
  try {
    activities = await listActivities();
  } catch {
    error = true;
  }

  const stats = summarize(
    activities.map((a) => ({
      distanceM: a.distanceM,
      elevGainM: a.elevGainM,
      movingTimeS: a.movingTimeS,
      maxElevationM: a.maxElevationM,
      startDate: a.startDate,
    })),
  );
  const years = byYear(activities.map((a) => ({ ...a, startDate: a.startDate })));
  const months = byMonth(activities.map((a) => ({ ...a, startDate: a.startDate })));

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold text-ritten-forest">Statistik</h1>

      {error && (
        <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
          Datenbank nicht verbunden – siehe Einstellungen.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BigStat value={String(stats.count)} label="Touren" />
        <BigStat value={formatDistance(stats.totalDistanceM)} label="Gesamtdistanz" />
        <BigStat value={formatElevation(stats.totalElevGainM)} label="Höhenmeter gesamt" />
        <BigStat value={formatDuration(stats.totalMovingTimeS)} label="Bewegungszeit" />
        <BigStat value={formatDistance(stats.longestM)} label="Längste Tour" />
        <BigStat value={`${stats.highestM} m`} label="Höchster Punkt" />
      </div>

      <CoverageCard />

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-700">Distanz pro Jahr (km)</h2>
        {years.length > 0 ? (
          <YearChart data={years} />
        ) : (
          <p className="text-sm text-slate-400">Noch keine Daten.</p>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-700">Distanz pro Monat (km)</h2>
        {stats.count > 0 ? (
          <MonthChart data={months} />
        ) : (
          <p className="text-sm text-slate-400">Noch keine Daten.</p>
        )}
      </div>
    </div>
  );
}
