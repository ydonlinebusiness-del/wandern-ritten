import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { fetchTrails } from "@/lib/overpass";
import { getDb, schema } from "@/db/client";

export const maxDuration = 120;

/**
 * Importiert das offizielle Rittner Wegenetz von OpenStreetMap (Overpass).
 * Idempotent: bestehende Wege (osm_id) werden aktualisiert.
 */
export async function POST() {
  let trails;
  try {
    trails = await fetchTrails();
  } catch (e) {
    return NextResponse.json(
      { error: `Overpass-Abruf fehlgeschlagen: ${String(e)}` },
      { status: 502 },
    );
  }

  if (trails.length === 0) {
    return NextResponse.json({ imported: 0, note: "Keine Wege gefunden." });
  }

  const db = getDb();
  // In Blöcken einfügen (onConflictDoUpdate für Idempotenz).
  const chunkSize = 200;
  let imported = 0;
  for (let i = 0; i < trails.length; i += chunkSize) {
    const chunk = trails.slice(i, i + chunkSize);
    await db
      .insert(schema.trails)
      .values(
        chunk.map((t) => ({
          osmId: t.osmId,
          name: t.name,
          ref: t.ref,
          sacScale: t.sacScale,
          geometry: t.geometry,
          lengthM: t.lengthM,
        })),
      )
      .onConflictDoUpdate({
        target: schema.trails.osmId,
        set: {
          name: sql`excluded.name`,
          geometry: sql`excluded.geometry`,
          lengthM: sql`excluded.length_m`,
        },
      });
    imported += chunk.length;
  }

  return NextResponse.json({ imported });
}
