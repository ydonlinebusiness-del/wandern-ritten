import { NextResponse } from "next/server";
import { getDb, schema } from "@/db/client";
import { listPlannedRoutes } from "@/db/repo";
import type { LineString } from "geojson";
import type { ElevationPoint } from "@/lib/types";

export async function GET() {
  const routes = await listPlannedRoutes();
  return NextResponse.json({ routes });
}

interface SaveBody {
  name: string;
  geometry: LineString;
  waypoints: Array<[number, number]>;
  elevationProfile?: ElevationPoint[];
  distanceM: number;
  elevGainM: number;
  notes?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as SaveBody;
  if (!body.name || !body.geometry || !body.waypoints?.length) {
    return NextResponse.json({ error: "Name, Geometrie und Wegpunkte nötig." }, { status: 400 });
  }
  const db = getDb();
  const rows = await db
    .insert(schema.plannedRoutes)
    .values({
      name: body.name,
      geometry: body.geometry,
      waypoints: body.waypoints,
      elevationProfile: body.elevationProfile,
      distanceM: body.distanceM ?? 0,
      elevGainM: body.elevGainM ?? 0,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json({ route: rows[0] });
}
