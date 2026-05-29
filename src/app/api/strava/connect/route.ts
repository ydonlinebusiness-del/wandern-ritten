import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/strava";

export async function GET() {
  if (!process.env.STRAVA_CLIENT_ID) {
    return NextResponse.json(
      { error: "STRAVA_CLIENT_ID ist nicht konfiguriert." },
      { status: 500 },
    );
  }
  return NextResponse.redirect(buildAuthorizeUrl());
}
