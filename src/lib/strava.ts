import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

const STRAVA_OAUTH = "https://www.strava.com/oauth/token";
const STRAVA_API = "https://www.strava.com/api/v3";

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete?: { id: number };
}

export interface StravaActivitySummary {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
  distance: number; // m
  total_elevation_gain: number; // m
  moving_time: number; // s
  elapsed_time: number; // s
  elev_high?: number;
  map?: { summary_polyline?: string };
}

/** OAuth-Autorisierungs-URL für den "Connect with Strava"-Button. */
export function buildAuthorizeUrl(): string {
  const base = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID ?? "",
    redirect_uri: `${base}/api/strava/callback`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "read,activity:read_all",
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

/** Tauscht einen OAuth-Code gegen Tokens und speichert sie. */
export async function exchangeCode(code: string): Promise<void> {
  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Strava Token-Tausch fehlgeschlagen: ${res.status}`);
  const data = (await res.json()) as StravaTokenResponse;
  await saveTokens(data);
}

async function saveTokens(data: StravaTokenResponse): Promise<void> {
  const db = getDb();
  const athleteId = String(data.athlete?.id ?? "me");
  const expiresAt = new Date(data.expires_at * 1000);
  const existing = await db.select().from(schema.stravaTokens).limit(1);
  if (existing.length > 0) {
    await db
      .update(schema.stravaTokens)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        athleteId,
        updatedAt: new Date(),
      })
      .where(eq(schema.stravaTokens.id, existing[0].id));
  } else {
    await db.insert(schema.stravaTokens).values({
      athleteId,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
    });
  }
}

/** Liefert einen gültigen Access-Token (erneuert ihn bei Bedarf). */
export async function getValidAccessToken(): Promise<string | null> {
  const db = getDb();
  const rows = await db.select().from(schema.stravaTokens).limit(1);
  if (rows.length === 0) return null;
  const token = rows[0];

  // 60s Puffer
  if (token.expiresAt.getTime() > Date.now() + 60_000) {
    return token.accessToken;
  }

  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });
  if (!res.ok) throw new Error(`Strava Token-Refresh fehlgeschlagen: ${res.status}`);
  const data = (await res.json()) as StravaTokenResponse;
  await saveTokens({ ...data, athlete: { id: Number(token.athleteId) || 0 } });
  return data.access_token;
}

export async function isConnected(): Promise<boolean> {
  const db = getDb();
  const rows = await db.select().from(schema.stravaTokens).limit(1);
  return rows.length > 0;
}

/** Holt eine Seite mit Aktivitäten. */
export async function fetchActivities(
  accessToken: string,
  page = 1,
  perPage = 50,
): Promise<StravaActivitySummary[]> {
  const url = `${STRAVA_API}/athlete/activities?page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Strava-Aktivitäten Abruf fehlgeschlagen: ${res.status}`);
  return (await res.json()) as StravaActivitySummary[];
}

/** Holt den Höhen-Stream (altitude + latlng) einer Aktivität. */
export async function fetchAltitudeStream(
  accessToken: string,
  activityId: number,
): Promise<{ latlng?: [number, number][]; altitude?: number[] }> {
  const url = `${STRAVA_API}/activities/${activityId}/streams?keys=latlng,altitude&key_by_type=true`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return {};
  const data = (await res.json()) as Record<string, { data: unknown }>;
  return {
    latlng: data.latlng?.data as [number, number][] | undefined,
    altitude: data.altitude?.data as number[] | undefined,
  };
}
