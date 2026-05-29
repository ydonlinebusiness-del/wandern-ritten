"use client";

import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/planner/Planner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center text-slate-500">
      Planer wird geladen …
    </div>
  ),
});

export default function PlanenPage() {
  return <Planner />;
}
