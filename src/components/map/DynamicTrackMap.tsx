"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type TrackMapType from "./TrackMap";

const TrackMap = dynamic(() => import("./TrackMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8eef2] text-slate-500">
      Karte wird geladen …
    </div>
  ),
});

export default function DynamicTrackMap(
  props: ComponentProps<typeof TrackMapType>,
) {
  return <TrackMap {...props} />;
}
