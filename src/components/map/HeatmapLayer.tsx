"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

/** Rendert eine Heatmap aus allen Trackpunkten. */
export default function HeatmapLayer({
  points,
  visible,
}: {
  points: [number, number][];
  visible: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!visible || points.length === 0) return;
    const layer = L.heatLayer(points as L.HeatLatLngTuple[], {
      radius: 12,
      blur: 18,
      maxZoom: 16,
      minOpacity: 0.35,
      gradient: { 0.3: "#3b82f6", 0.6: "#f59e0b", 1.0: "#e11d48" },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, visible]);

  return null;
}
