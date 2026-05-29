import Link from "next/link";
import { listActivities } from "@/db/repo";
import { formatDistance, formatDuration, formatElevation } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function TourenPage() {
  let activities: Awaited<ReturnType<typeof listActivities>> = [];
  let error = false;
  try {
    activities = await listActivities();
  } catch {
    error = true;
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-semibold text-ritten-forest">Touren</h1>

      {error && (
        <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
          Datenbank nicht verbunden – siehe Einstellungen.
        </p>
      )}

      {!error && activities.length === 0 && (
        <p className="rounded-lg bg-white p-4 text-slate-600 shadow-sm">
          Noch keine Touren vorhanden. Importiere sie unter{" "}
          <Link href="/einstellungen" className="text-ritten-forest underline">
            Einstellungen
          </Link>
          .
        </p>
      )}

      <ul className="space-y-2">
        {activities.map((a) => (
          <li key={a.id}>
            <Link
              href={`/touren/${a.id}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div>
                <div className="font-medium text-slate-800">{a.name}</div>
                <div className="text-xs text-slate-500">
                  {a.startDate
                    ? new Date(a.startDate).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "ohne Datum"}
                  {" · "}
                  <span className="capitalize">{a.source}</span>
                </div>
              </div>
              <div className="flex gap-4 text-right text-sm">
                <span title="Distanz">{formatDistance(a.distanceM)}</span>
                <span className="text-ritten-moss" title="Höhenmeter">
                  ↑ {formatElevation(a.elevGainM)}
                </span>
                {a.movingTimeS > 0 && (
                  <span className="hidden text-slate-500 sm:inline" title="Dauer">
                    {formatDuration(a.movingTimeS)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
