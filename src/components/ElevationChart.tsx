"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ElevationPoint } from "@/lib/types";

/** Höhenprofil: Distanz (km) auf X, Höhe (m) auf Y. */
export default function ElevationChart({
  profile,
  height = 180,
}: {
  profile: ElevationPoint[];
  height?: number;
}) {
  if (!profile || profile.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-400">
        Kein Höhenprofil verfügbar.
      </div>
    );
  }

  const data = profile.map((p) => ({
    km: +(p.distM / 1000).toFixed(2),
    ele: p.eleM,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="eleFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4c956c" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#4c956c" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="km"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={(v) => `${v} km`}
          tick={{ fontSize: 11 }}
          stroke="#94a3b8"
        />
        <YAxis
          tickFormatter={(v) => `${v} m`}
          width={52}
          tick={{ fontSize: 11 }}
          domain={["dataMin - 20", "dataMax + 20"]}
          stroke="#94a3b8"
        />
        <Tooltip
          formatter={(v) => [`${v} m`, "Höhe"]}
          labelFormatter={(l) => `${l} km`}
        />
        <Area
          type="monotone"
          dataKey="ele"
          stroke="#2f6f4f"
          strokeWidth={2}
          fill="url(#eleFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
