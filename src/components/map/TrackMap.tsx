"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { TILE_LAYERS, getMapCenter } from "@/lib/config";

type LatLng = [number, number, number?];

function FitBounds({ track }: { track: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (track.length < 2) return;
    const bounds = L.latLngBounds(track.map((p) => [p[0], p[1]] as [number, number]));
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, track]);
  return null;
}

/** Kleine Karte zur Vorschau einer einzelnen Tour/Route. */
export default function TrackMap({
  track,
  color = "#e85d04",
}: {
  track: LatLng[];
  color?: string;
}) {
  const center = getMapCenter();
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={center.zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url={TILE_LAYERS.topo.url}
        attribution={TILE_LAYERS.topo.attribution}
        maxZoom={TILE_LAYERS.topo.maxZoom}
      />
      {track.length >= 2 && (
        <Polyline
          positions={track.map((p) => [p[0], p[1]] as [number, number])}
          pathOptions={{ color, weight: 4, opacity: 0.9 }}
        />
      )}
      <FitBounds track={track} />
    </MapContainer>
  );
}
