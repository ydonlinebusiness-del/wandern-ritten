import { NextResponse } from "next/server";
import { getDb, schema } from "@/db/client";
import { RITTEN_POIS } from "@/lib/poiSeed";

/** Befüllt die POI-Tabelle mit den Rittner Highlights (idempotent: leert vorher). */
export async function POST() {
  const db = getDb();
  await db.delete(schema.pois);
  const rows = await db
    .insert(schema.pois)
    .values(
      RITTEN_POIS.map((p) => ({
        name: p.name,
        type: p.type,
        lat: p.lat,
        lng: p.lng,
        elevationM: p.elevationM,
        description: p.description,
      })),
    )
    .returning();
  return NextResponse.json({ imported: rows.length });
}
