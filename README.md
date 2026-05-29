# 🏔️ Wandern am Ritten

Eine private Web-App für das Rittner Gebiet (Renon, Südtirol):

- **Topografische Wanderkarte** (OpenTopoMap) mit markierten Wanderwegen
- **Gelaufene Touren** – automatisch aus **Strava** und/oder per **GPX-Upload** – farbig hervorgehoben
- **Tourendetails** mit **Höhenprofil** und **Foto-Galerie**
- **Heatmap** aller Touren
- **Erkundungs-Fortschritt %** – Abgleich mit dem offiziellen OSM-Wegenetz
- **Highlights/POIs** (Rittner Horn, Erdpyramiden, Wolfsgrubener See, Rittner Bahn …)
- **Tourenplaner** mit Snap auf echte Wege (BRouter) inkl. Distanz & Höhenprofil
- **Statistik-Dashboard**
- Einfacher **Passwortschutz**, PWA-fähig (auf dem Handy „zum Startbildschirm")

## Tech-Stack

Next.js 15 (App Router) · TypeScript · Tailwind · Leaflet · Neon (Postgres) ·
Drizzle ORM · Vercel Blob (Fotos) · Strava API · BRouter · Overpass (OSM).

---

## Schnellstart (lokal)

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen (siehe unten)
pnpm db:migrate              # Tabellen in Neon anlegen
pnpm dev                     # http://localhost:3000
```

`pnpm test` führt die Unit-Tests aus, `pnpm build` den Produktions-Build.

---

## Einrichtung Schritt für Schritt

### 1. Datenbank (Neon)

1. Auf <https://neon.tech> kostenlos ein Projekt anlegen.
2. Den **Connection String** kopieren (Format `postgresql://…?sslmode=require`).
3. In `.env.local` als `DATABASE_URL` eintragen.
4. Tabellen anlegen: `pnpm db:migrate`.

> In Vercel kannst du Neon auch direkt unter **Storage → Neon** anbinden –
> dann wird `DATABASE_URL` automatisch gesetzt.

### 2. Fotospeicher (Vercel Blob)

1. In Vercel: **Storage → Blob** anlegen.
2. Der Token `BLOB_READ_WRITE_TOKEN` wird automatisch gesetzt (bei `vercel env pull`
   landet er in `.env.local`).

### 3. Strava-API-App

1. <https://www.strava.com/settings/api> öffnen und eine App anlegen.
2. **Authorization Callback Domain** auf deine Domain setzen, **ohne** `https://`,
   z. B. `wandern-ritten.vercel.app` (lokal: `localhost`).
3. `STRAVA_CLIENT_ID` und `STRAVA_CLIENT_SECRET` in die Env-Variablen eintragen.
4. `APP_BASE_URL` auf deine Basis-URL setzen (lokal `http://localhost:3000`).

### 4. Passwort & Karte

- `APP_PASSWORD`: frei wählbares Passwort fürs Login (leer lassen = kein Schutz).
- `SESSION_SECRET`: langer Zufallsstring zum Signieren des Cookies.
- `NEXT_PUBLIC_RITTEN_CENTER`: Kartenmittelpunkt `lat,lng,zoom` (Default `46.54,11.47,13`).

---

## Erste Befüllung (einmalig, in der App)

Unter **Einstellungen**:

1. **Mit Strava verbinden** → Strava-Login bestätigen → zurück zur App.
2. **Jetzt synchronisieren** – importiert deine Rittner Touren (filtert automatisch
   auf das Gebiet).
3. Alternativ/ergänzend **GPX-Dateien** hochladen.
4. **Wegenetz laden** – holt das offizielle Wanderwegenetz von OpenStreetMap
   (Basis für den Erkundungs-Fortschritt).
5. **Highlights laden** – setzt die POI-Marker.

Danach: Karte, Touren, Statistik und Planer nutzen. 🥾

---

## Deployment (Vercel)

1. Repo in Vercel importieren.
2. **Storage → Neon** und **Storage → Blob** anbinden.
3. Env-Variablen setzen: `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`,
   `APP_BASE_URL` (= deine Vercel-URL), `APP_PASSWORD`, `SESSION_SECRET`,
   `NEXT_PUBLIC_RITTEN_CENTER`.
4. In der Strava-App die **Callback Domain** auf die Vercel-Domain setzen.
5. Deploy. Migration einmalig ausführen (`pnpm db:migrate` lokal gegen die
   Produktions-`DATABASE_URL`, oder via Vercel-Build-Step).

---

## Hinweise

- **Kartenkacheln** (OpenTopoMap, Waymarked Trails) sind für privaten, geringen
  Traffic gedacht; Attribution ist eingebaut.
- **Erkundungs-Fortschritt** ist eine Näherung: ein Weg gilt als begangen, wenn eine
  Spur innerhalb von ~25 m verläuft (`COVERAGE_BUFFER_M` in `src/lib/config.ts`).
- Das Rittner Gebiet ist über die Bounding-Box in `src/lib/config.ts` definiert –
  dort kannst du den Bereich bei Bedarf erweitern.

## Projektstruktur

```
src/
  app/                 Seiten (Karte, Touren, Planen, Statistik, Einstellungen) + API-Routen
  components/          Karten- (Leaflet), Planer-, Chart- und UI-Komponenten
  db/                  Drizzle-Schema, Client, Repository
  lib/                 Geo-/Strava-/BRouter-/Overpass-/Coverage-/Stats-Logik (+ Tests)
drizzle/               Generierte SQL-Migrationen
```
