"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function YearChart({
  data,
}: {
  data: Array<{ year: number; distanceKm: number; count: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis tickFormatter={(v) => `${v}`} width={40} tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip formatter={(v) => [`${v} km`, "Distanz"]} />
        <Bar dataKey="distanceKm" fill="#2f6f4f" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthChart({
  data,
}: {
  data: Array<{ month: number; distanceKm: number; count: number }>;
}) {
  const chartData = data.map((d) => ({ ...d, label: MONTHS[d.month - 1] }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tickFormatter={(v) => `${v}`} width={40} tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <Tooltip formatter={(v) => [`${v} km`, "Distanz"]} />
        <Bar dataKey="distanceKm" fill="#4c956c" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
