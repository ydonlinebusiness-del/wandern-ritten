"use client";

import { useCallback, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { TILE_LAYERS, getMapCenter } from "@/lib/config";
import ElevationChart from "@/components/ElevationChart";
import { formatDistance, formatElevation } from "@/lib/stats";
import type { ElevationPoint } from "@/lib/types";

type Waypoint = [number, number]; // [lat, lng]

function numberIcon(n: number): L.DivIcon {
  return L.divIcon({
    className: "wp-marker",
    html: `<div style="background:#7c3aed;color:#fff;border-radius:9999px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4)">${n}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function ClickHandler({ onAdd }: { onAdd: (wp: Waypoint) => void }) {
  useMapEvents({
    click(e) {
      onAdd([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function Planner() {
  const center = getMapCenter();
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [routePoints, setRoutePoints] = useState<Waypoint[]>([]);
  const [profile, setProfile] = useState<ElevationPoint[]>([]);
  const [distanceM, setDistanceM] = useState(0);
  const [elevGainM, setElevGainM] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const snap = useCallback(async (wps: Waypoint[]) => {
    if (wps.length < 2) {
      setRoutePoints([]);
      setProfile([]);
      setDistanceM(0);
      setElevGainM(0);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/route/snap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints: wps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
      setRoutePoints(data.points.map((p: number[]) => [p[0], p[1]] as Waypoint));
      setProfile(data.elevationProfile ?? []);
      setDistanceM(data.distanceM ?? 0);
      setElevGainM(data.elevGainM ?? 0);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }, []);

  const addWaypoint = useCallback(
    (wp: Waypoint) => {
      setSaved(null);
      setWaypoints((prev) => {
        const next = [...prev, wp];
        void snap(next);
        return next;
      });
    },
    [snap],
  );

  function undo() {
    setSaved(null);
    setWaypoints((prev) => {
      const next = prev.slice(0, -1);
      void snap(next);
      return next;
    });
  }

  function clear() {
    setSaved(null);
    setWaypoints([]);
    setRoutePoints([]);
    setProfile([]);
    setDistanceM(0);
    setElevGainM(0);
  }

  async function save() {
    if (routePoints.length < 2) return;
    const name = window.prompt("Name der geplanten Route:");
    if (!name) return;
    setBusy(true);
    try {
      const geometry = {
        type: "LineString",
        coordinates: routePoints.map(([lat, lng]) => [lng, lat]),
      };
      const res = await fetch("/api/planned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          geometry,
          waypoints,
          elevationProfile: profile,
          distanceM,
          elevGainM,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Fehler ${res.status}`);
      }
      setSaved(`✅ „${name}" gespeichert.`);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  const drawLine = useMemo(
    () => (routePoints.length >= 2 ? routePoints : waypoints),
    [routePoints, waypoints],
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2 text-sm">
        <span className="font-medium text-slate-700">
          🥾 Route planen – auf die Karte klicken
        </span>
        <span className="ml-auto flex items-center gap-3">
          <span>{formatDistance(distanceM)}</span>
          <span className="text-ritten-moss">↑ {formatElevation(elevGainM)}</span>
          {busy && <span className="text-slate-400">berechne …</span>}
        </span>
        <div className="flex w-full gap-2 sm:w-auto">
          <button
            onClick={undo}
            disabled={waypoints.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
          >
            Zurück
          </button>
          <button
            onClick={clear}
            disabled={waypoints.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
          >
            Löschen
          </button>
          <button
            onClick={save}
            disabled={routePoints.length < 2 || busy}
            className="rounded-lg bg-ritten-forest px-3 py-1.5 font-medium text-white hover:bg-ritten-moss disabled:opacity-40"
          >
            Speichern
          </button>
        </div>
      </div>

      {(error || saved) && (
        <div
          className={`px-3 py-1.5 text-sm ${
            error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {error ?? saved}
        </div>
      )}

      <div className="relative flex-1">
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
          <ClickHandler onAdd={addWaypoint} />
          {drawLine.length >= 2 && (
            <Polyline
              positions={drawLine}
              pathOptions={{ color: "#7c3aed", weight: 4, opacity: 0.85 }}
            />
          )}
          {waypoints.map((wp, i) => (
            <Marker key={i} position={wp} icon={numberIcon(i + 1)} />
          ))}
        </MapContainer>
      </div>

      {profile.length > 1 && (
        <div className="border-t border-slate-200 bg-white p-3">
          <ElevationChart profile={profile} height={120} />
        </div>
      )}
    </div>
  );
}
