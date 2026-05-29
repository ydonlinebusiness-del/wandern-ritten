import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Drizzle-Client gegen Neon (HTTP-Treiber, serverless-freundlich).
 * Lazy initialisiert, damit Builds ohne DATABASE_URL nicht fehlschlagen.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL ist nicht gesetzt. Bitte Neon-Datenbank in Vercel anbinden " +
        "oder .env.local konfigurieren.",
    );
  }
  const sql = neon(url);
  _db = drizzle(sql, { schema });
  return _db;
}

export { schema };
