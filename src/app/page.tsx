import DynamicMap from "@/components/map/DynamicMap";
import { getMapData } from "@/lib/serverData";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { activities, pois, planned, dbReady } = await getMapData();

  return (
    <div className="map-shell relative">
      {!dbReady && (
        <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-900 shadow">
          Datenbank noch nicht verbunden. Siehe{" "}
          <Link href="/einstellungen" className="font-semibold underline">
            Einstellungen
          </Link>
          .
        </div>
      )}
      {dbReady && activities.length === 0 && (
        <div className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm text-slate-700 shadow">
          Noch keine Touren. Verbinde Strava oder lade GPX-Dateien unter{" "}
          <Link href="/einstellungen" className="font-semibold text-ritten-forest underline">
            Einstellungen
          </Link>{" "}
          hoch.
        </div>
      )}
      <DynamicMap activities={activities} pois={pois} planned={planned} />
    </div>
  );
}
