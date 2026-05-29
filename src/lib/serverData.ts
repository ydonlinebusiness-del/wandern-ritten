import "server-only";
import { listActivities, listPois, listPlannedRoutes } from "@/db/repo";
import type {
  MapActivity,
  MapPlannedRoute,
  MapPoi,
} from "@/components/map/types";

/** Lädt die Karten-Basisdaten; gibt bei fehlender DB leere Listen zurück. */
export async function getMapData(): Promise<{
  activities: MapActivity[];
  pois: MapPoi[];
  planned: MapPlannedRoute[];
  dbReady: boolean;
}> {
  try {
    const [acts, pois, planned] = await Promise.all([
      listActivities(),
      listPois(),
      listPlannedRoutes(),
    ]);
    return {
      dbReady: true,
      activities: acts.map((a) => ({
        id: a.id,
        name: a.name,
        source: a.source,
        track: a.track,
      })),
      pois: pois.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        lat: p.lat,
        lng: p.lng,
        elevationM: p.elevationM,
        description: p.description,
      })),
      planned: planned.map((r) => ({
        id: r.id,
        name: r.name,
        geometry: r.geometry,
      })),
    };
  } catch {
    return { activities: [], pois: [], planned: [], dbReady: false };
  }
}
