import L from "leaflet";

const EMOJI: Record<string, string> = {
  peak: "⛰️",
  lake: "🏊",
  village: "🏘️",
  sight: "📍",
  cablecar: "🚠",
  highlight: "⭐",
};

/** Erzeugt ein DivIcon mit Emoji für einen POI-Typ (umgeht fehlende Marker-PNGs). */
export function poiIcon(type: string): L.DivIcon {
  const emoji = EMOJI[type] ?? "📍";
  return L.divIcon({
    className: "poi-marker",
    html: `<div style="font-size:20px;line-height:20px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.4))">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 22],
    popupAnchor: [0, -20],
  });
}
