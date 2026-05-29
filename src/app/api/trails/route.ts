import { NextResponse } from "next/server";
import { listTrails } from "@/db/repo";

/** Liefert das offizielle Wegenetz (für die lazy geladene Karten-Ebene). */
export async function GET() {
  try {
    const trails = await listTrails();
    return NextResponse.json({
      trails: trails.map((t) => ({
        osmId: t.osmId,
        name: t.name,
        ref: t.ref,
        geometry: t.geometry,
      })),
    });
  } catch {
    return NextResponse.json({ trails: [] });
  }
}
