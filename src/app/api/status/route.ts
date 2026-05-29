import { NextResponse } from "next/server";
import { getDb, schema } from "@/db/client";
import { isConnected } from "@/lib/strava";
import { sql } from "drizzle-orm";

/** Liefert Verbindungs- und Datenstatus für die Einstellungsseite. */
export async function GET() {
  try {
    const db = getDb();
    const [stravaConnected, acts, trails, pois] = await Promise.all([
      isConnected().catch(() => false),
      db.select({ c: sql<number>`count(*)` }).from(schema.activities),
      db.select({ c: sql<number>`count(*)` }).from(schema.trails),
      db.select({ c: sql<number>`count(*)` }).from(schema.pois),
    ]);
    return NextResponse.json({
      dbReady: true,
      stravaConnected,
      activityCount: Number(acts[0]?.c ?? 0),
      trailCount: Number(trails[0]?.c ?? 0),
      poiCount: Number(pois[0]?.c ?? 0),
    });
  } catch {
    return NextResponse.json({
      dbReady: false,
      stravaConnected: false,
      activityCount: 0,
      trailCount: 0,
      poiCount: 0,
    });
  }
}
