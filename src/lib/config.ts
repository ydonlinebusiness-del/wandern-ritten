/**
 * Zentrale Konfiguration für das Rittner Wandergebiet.
 */

/**
 * Bounding-Box des Rittner Gebiets (Renon, Südtirol).
 * Wird genutzt, um Strava-Aktivitäten zu filtern und den OSM-Wege-Import einzugrenzen.
 * Reihenfolge: [west (minLng), süd (minLat), ost (maxLng), nord (maxLat)]
 */
export const RITTEN_BBOX = {
  minLng: 11.38,
  minLat: 46.49,
  maxLng: 11.56,
  maxLat: 46.63,
} as const;

/** Mittelpunkt + Zoom der Karte, aus NEXT_PUBLIC_RITTEN_CENTER ("lat,lng,zoom"). */
export function getMapCenter(): { lat: number; lng: number; zoom: number } {
  const raw = process.env.NEXT_PUBLIC_RITTEN_CENTER ?? "46.54,11.47,13";
  const [lat, lng, zoom] = raw.split(",").map((v) => Number(v.trim()));
  return {
    lat: Number.isFinite(lat) ? lat : 46.54,
    lng: Number.isFinite(lng) ? lng : 11.47,
    zoom: Number.isFinite(zoom) ? zoom : 13,
  };
}

/** Default-Puffer (Meter) für die Erkundungs-/Coverage-Berechnung. */
export const COVERAGE_BUFFER_M = 25;

/** Karten-Kachel-Quellen. */
export const TILE_LAYERS = {
  topo: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      'Kartendaten: © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende, SRTM | Darstellung: © <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    maxZoom: 17,
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende',
    maxZoom: 19,
  },
  /** Overlay mit markierten Wanderwegen. */
  hikingOverlay: {
    url: "https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png",
    attribution:
      '<a href="https://hiking.waymarkedtrails.org">Waymarked Trails</a> (CC-BY-SA)',
    maxZoom: 18,
  },
} as const;
