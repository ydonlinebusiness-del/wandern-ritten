/**
 * Leichtgewichtiger Passwortschutz für die private App.
 * Funktioniert in Edge- (Middleware) und Node-Umgebung über Web Crypto.
 */

export const SESSION_COOKIE = "ritten_session";

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.APP_PASSWORD || "ritten-dev-secret";
}

async function hmac(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Erzeugt den signierten Session-Token-Wert. */
export function sessionToken(): Promise<string> {
  return hmac("authenticated", getSecret());
}

/** Prüft, ob ein Cookie-Wert ein gültiger Session-Token ist. */
export async function isValidSession(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const expected = await sessionToken();
  // konstante-Zeit-ähnlicher Vergleich
  if (value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < value.length; i++) {
    diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/** Prüft das eingegebene Passwort gegen APP_PASSWORD. */
export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return true; // kein Passwort gesetzt → offen (z. B. lokal)
  return input === expected;
}
