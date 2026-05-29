import { NextResponse } from "next/server";
import { snapRoute } from "@/lib/brouter";

export const maxDuration = 30;

/**
 * Snappt eine Liste von Wegpunkten ([lat,lng]) entlang echter Wanderwege (BRouter).
 * Body: { waypoints: [[lat,lng], ...], profile?: string }
 */
export async function POST(req: Request) {
  let body: { waypoints?: Array<[number, number]>; profile?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger JSON-Body." }, { status: 400 });
  }

  const waypoints = body.waypoints ?? [];
  if (waypoints.length < 2) {
    return NextResponse.json(
      { error: "Mindestens zwei Wegpunkte erforderlich." },
      { status: 400 },
    );
  }

  try {
    const route = await snapRoute(waypoints, body.profile);
    return NextResponse.json(route);
  } catch (e) {
    return NextResponse.json(
      { error: `Routing fehlgeschlagen: ${String(e)}` },
      { status: 502 },
    );
  }
}
