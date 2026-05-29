"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type MapViewType from "./MapView";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8eef2] text-slate-500">
      Karte wird geladen …
    </div>
  ),
});

/** Lädt die Leaflet-Karte nur clientseitig (kein SSR). */
export default function DynamicMap(props: ComponentProps<typeof MapViewType>) {
  return <MapView {...props} />;
}
