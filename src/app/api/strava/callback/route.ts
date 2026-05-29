import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/strava";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/einstellungen?strava=fehler", req.url),
    );
  }

  try {
    await exchangeCode(code);
    return NextResponse.redirect(
      new URL("/einstellungen?strava=verbunden", req.url),
    );
  } catch (e) {
    console.error("Strava-Callback-Fehler:", e);
    return NextResponse.redirect(
      new URL("/einstellungen?strava=fehler", req.url),
    );
  }
}
