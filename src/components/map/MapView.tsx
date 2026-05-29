"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  LayerGroup,
} from "react-leaflet";
import Link from "next/link";
import { TILE_LAYERS, getMapCenter } from "@/lib/config";
import HeatmapLayer from "./HeatmapLayer";
import { poiIcon } from "./icons";
import type {
  MapActivity,
  MapLayersState,
  MapPlannedRoute,
  MapPoi,
  MapTrail,
} from "./types";

interface Props {
  activities: MapActivity[];
  pois: MapPoi[];
  planned: MapPlannedRoute[];
}

const TOGGLE_LABELS: Record<keyof MapLayersState, string> = {
  activities: "Gelaufene Touren",
  heatmap: "Heatmap",
  trails: "Offizielle Wege",
  pois: "Highlights",
  planned: "Geplante Routen",
};

export default function MapView({ activities, pois, planned }: Props) {
  const center = getMapCenter();
  const [layers, setLayers] = useState<MapLayersState>({
    activities: true,
    heatmap: false,
    trails: false,
    pois: true,
    planned: true,
  });

  // Wegenetz + Erkundungs-Status werden erst geladen, wenn die Wege-Ebene
  // eingeschaltet wird (großer Payload → lazy).
  const [trails, setTrails] = useState<MapTrail[] | null>(null);
  const [coveredIds, setCoveredIds] = useState<string[] | null>(null);
  useEffect(() => {
    if (!layers.trails) return;
    if (trails === null) {
      fetch("/api/trails")
        .then((r) => r.json())
        .then((d) => setTrails(d.trails ?? []))
        .catch(() => setTrails([]));
    }
    if (coveredIds === null) {
      fetch("/api/coverage")
        .then((r) => r.json())
        .then((d) => setCoveredIds(d.coveredTrailIds ?? []))
        .catch(() => setCoveredIds([]));
    }
  }, [layers.trails, trails, coveredIds]);

  const covered = useMemo(() => new Set(coveredIds ?? []), [coveredIds]);
  const heatPoints = useMemo<[number, number][]>(
    () =>
      activities.flatMap((a) => a.track.map((p) => [p[0], p[1]] as [number, number])),
    [activities],
  );

  function toggle(key: keyof MapLayersState) {
    setLayers((s) => ({ ...s, [key]: !s[key] }));
  }

  return (
    <div className="relative h-full w-full">
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
        {layers.trails && (
          <TileLayer
            url={TILE_LAYERS.hikingOverlay.url}
            attribution={TILE_LAYERS.hikingOverlay.attribution}
            opacity={0.7}
          />
        )}

        {/* Offizielles Wegenetz: begangen (grün) vs. offen (grau) */}
        {layers.trails && trails && (
          <LayerGroup>
            {trails.map((t) => {
              const positions = t.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng] as [number, number],
              );
              const done = covered.has(t.osmId);
              return (
                <Polyline
                  key={t.osmId}
                  positions={positions}
                  pathOptions={{
                    color: done ? "#16a34a" : "#94a3b8",
                    weight: done ? 4 : 2,
                    opacity: done ? 0.9 : 0.6,
                    dashArray: done ? undefined : "4 6",
                  }}
                >
                  {(t.ref || t.name) && (
                    <Popup>
                      <div className="space-y-0.5">
                        {t.ref && (
                          <div className="font-semibold">Weg {t.ref}</div>
                        )}
                        {t.name && <div className="text-sm">{t.name}</div>}
                        <div className="text-xs text-slate-500">
                          {done ? "✓ schon gelaufen" : "noch offen"}
                        </div>
                      </div>
                    </Popup>
                  )}
                </Polyline>
              );
            })}
          </LayerGroup>
        )}

        {/* Gelaufene Touren */}
        {layers.activities && (
          <LayerGroup>
            {activities.map((a) => (
              <Polyline
                key={a.id}
                positions={a.track.map((p) => [p[0], p[1]] as [number, number])}
                pathOptions={{ color: "#e85d04", weight: 4, opacity: 0.85 }}
              >
                <Popup>
                  <div className="space-y-1">
                    <div className="font-semibold">{a.name}</div>
                    <Link
                      href={`/touren/${a.id}`}
                      className="text-ritten-sky underline"
                    >
                      Details ansehen →
                    </Link>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </LayerGroup>
        )}

        {/* Geplante Routen */}
        {layers.planned && (
          <LayerGroup>
            {planned.map((r) => (
              <Polyline
                key={r.id}
                positions={r.geometry.coordinates.map(
                  ([lng, lat]) => [lat, lng] as [number, number],
                )}
                pathOptions={{
                  color: "#7c3aed",
                  weight: 4,
                  opacity: 0.85,
                  dashArray: "1 8",
                }}
              >
                <Popup>{r.name} (geplant)</Popup>
              </Polyline>
            ))}
          </LayerGroup>
        )}

        {/* POIs / Highlights */}
        {layers.pois && (
          <LayerGroup>
            {pois.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={poiIcon(p.type)}>
                <Popup>
                  <div className="space-y-0.5">
                    <div className="font-semibold">{p.name}</div>
                    {p.elevationM ? (
                      <div className="text-xs text-slate-500">{p.elevationM} m</div>
                    ) : null}
                    {p.description ? (
                      <div className="text-xs">{p.description}</div>
                    ) : null}
                  </div>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>
        )}

        <HeatmapLayer points={heatPoints} visible={layers.heatmap} />
      </MapContainer>

      {/* Layer-Steuerung */}
      <div className="absolute right-3 top-3 z-[1000] rounded-xl bg-white/95 p-3 text-sm shadow-lg backdrop-blur">
        <div className="mb-1 font-semibold text-slate-700">Ebenen</div>
        {(Object.keys(TOGGLE_LABELS) as (keyof MapLayersState)[]).map((key) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 py-0.5">
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => toggle(key)}
              className="accent-ritten-forest"
            />
            <span>{TOGGLE_LABELS[key]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
