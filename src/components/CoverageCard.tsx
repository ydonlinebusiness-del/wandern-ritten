"use client";

import { useEffect, useState } from "react";
import type { CoverageResult } from "@/lib/types";

/** Zeigt den Erkundungs-Fortschritt (% des Wegenetzes begangen). */
export default function CoverageCard() {
  const [data, setData] = useState<(CoverageResult & { note?: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coverage")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const pct = data?.coveredPct ?? 0;
  const angle = (pct / 100) * 360;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 font-semibold text-slate-700">Erkundungs-Fortschritt</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Wird berechnet …</p>
      ) : data?.note ? (
        <p className="text-sm text-slate-500">{data.note}</p>
      ) : (
        <div className="flex items-center gap-4">
          <div
            className="relative h-28 w-28 shrink-0 rounded-full"
            style={{
              background: `conic-gradient(#2f6f4f ${angle}deg, #e2e8f0 ${angle}deg)`,
            }}
          >
            <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-bold text-ritten-forest">{pct}%</span>
              <span className="text-[10px] text-slate-400">erkundet</span>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <p>
              <strong>{Math.round((data?.coveredLengthM ?? 0) / 1000)} km</strong> von{" "}
              <strong>{Math.round((data?.totalTrailLengthM ?? 0) / 1000)} km</strong> des
              offiziellen Rittner Wegenetzes begangen.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Schalte auf der Karte die Ebene „Offizielle Wege“ ein, um begangene
              (grün) und offene (grau) Wege zu sehen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
