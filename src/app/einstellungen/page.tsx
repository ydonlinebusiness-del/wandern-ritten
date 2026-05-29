"use client";

import { useCallback, useEffect, useState } from "react";

interface Status {
  dbReady: boolean;
  stravaConnected: boolean;
  activityCount: number;
  trailCount: number;
  poiCount: number;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold text-slate-700">{title}</h2>
      {children}
    </section>
  );
}

export default function EinstellungenPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  useEffect(() => {
    refresh();
    const params = new URLSearchParams(window.location.search);
    if (params.get("strava") === "verbunden") setMsg("✅ Strava verbunden!");
    if (params.get("strava") === "fehler") setMsg("❌ Strava-Verbindung fehlgeschlagen.");
  }, [refresh]);

  async function run(label: string, fn: () => Promise<Response>) {
    setBusy(label);
    setMsg(null);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
      setMsg(formatResult(label, data));
      refresh();
    } catch (e) {
      setMsg(`❌ ${String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function uploadGpx(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    await run("gpx", () => fetch("/api/gpx/upload", { method: "POST", body: fd }));
    e.target.value = "";
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold text-ritten-forest">Einstellungen</h1>

      {msg && (
        <div className="rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{msg}</div>
      )}

      {status && !status.dbReady && (
        <div className="rounded-lg bg-amber-100 p-3 text-sm text-amber-900">
          Datenbank nicht verbunden. Bitte in Vercel eine Neon-Datenbank anlegen und{" "}
          <code>DATABASE_URL</code> setzen (siehe README).
        </div>
      )}

      <Card title="Strava">
        <p className="mb-3 text-sm text-slate-600">
          {status?.stravaConnected
            ? "✅ Verbunden. Synchronisiere neue Touren mit einem Klick."
            : "Verbinde dein Strava-Konto, um Touren automatisch zu importieren."}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/strava/connect"
            className="rounded-lg bg-[#fc4c02] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {status?.stravaConnected ? "Neu verbinden" : "Mit Strava verbinden"}
          </a>
          <button
            disabled={!status?.stravaConnected || busy !== null}
            onClick={() =>
              run("sync", () => fetch("/api/strava/sync", { method: "POST" }))
            }
            className="rounded-lg bg-ritten-forest px-3 py-2 text-sm font-medium text-white hover:bg-ritten-moss disabled:opacity-40"
          >
            {busy === "sync" ? "Synchronisiere …" : "Jetzt synchronisieren"}
          </button>
        </div>
      </Card>

      <Card title="GPX-Dateien hochladen">
        <p className="mb-3 text-sm text-slate-600">
          Lade Touren als GPX hoch (z. B. aus Garmin Connect). Nur Touren im Rittner
          Gebiet werden übernommen.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-ritten-forest px-3 py-2 text-sm font-medium text-white hover:bg-ritten-moss">
          {busy === "gpx" ? "Lädt hoch …" : "GPX auswählen"}
          <input
            type="file"
            accept=".gpx"
            multiple
            className="hidden"
            disabled={busy !== null}
            onChange={uploadGpx}
          />
        </label>
      </Card>

      <Card title="Rittner Daten laden">
        <p className="mb-3 text-sm text-slate-600">
          Einmalig: offizielles Wanderwegenetz (OpenStreetMap) und Highlights
          importieren – Basis für Erkundungs-Fortschritt und POIs.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={busy !== null}
            onClick={() =>
              run("trails", () => fetch("/api/seed/trails", { method: "POST" }))
            }
            className="rounded-lg border border-ritten-forest px-3 py-2 text-sm font-medium text-ritten-forest hover:bg-ritten-forest/5 disabled:opacity-40"
          >
            {busy === "trails" ? "Lädt Wege …" : `Wegenetz laden (${status?.trailCount ?? 0})`}
          </button>
          <button
            disabled={busy !== null}
            onClick={() =>
              run("pois", () => fetch("/api/seed/pois", { method: "POST" }))
            }
            className="rounded-lg border border-ritten-forest px-3 py-2 text-sm font-medium text-ritten-forest hover:bg-ritten-forest/5 disabled:opacity-40"
          >
            {busy === "pois" ? "Lädt POIs …" : `Highlights laden (${status?.poiCount ?? 0})`}
          </button>
        </div>
      </Card>

      {status && (
        <div className="text-center text-xs text-slate-400">
          {status.activityCount} Touren · {status.trailCount} Wege · {status.poiCount} Highlights
        </div>
      )}
    </div>
  );
}

function formatResult(label: string, data: Record<string, unknown>): string {
  switch (label) {
    case "sync":
      return `✅ Strava-Sync: ${data.imported} neu importiert, ${data.skipped} übersprungen.`;
    case "gpx":
      return `✅ GPX: ${data.imported} Tour(en) importiert.`;
    case "trails":
      return `✅ Wegenetz geladen: ${data.imported} Wege.`;
    case "pois":
      return `✅ Highlights geladen: ${data.imported}.`;
    default:
      return "✅ Erledigt.";
  }
}
