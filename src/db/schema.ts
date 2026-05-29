import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { LineString } from "geojson";
import type { ElevationPoint, TrackPoint } from "@/lib/types";

/** Strava OAuth-Tokens (privat – i.d.R. eine Zeile). */
export const stravaTokens = pgTable("strava_tokens", {
  id: serial("id").primaryKey(),
  athleteId: text("athlete_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Gelaufene Touren (aus Strava oder GPX). */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  source: text("source").$type<"strava" | "gpx">().notNull(),
  stravaId: text("strava_id"),
  name: text("name").notNull(),
  type: text("type").notNull().default("Hike"),
  startDate: timestamp("start_date", { withTimezone: true }),
  distanceM: real("distance_m").notNull().default(0),
  elevGainM: real("elev_gain_m").notNull().default(0),
  movingTimeS: integer("moving_time_s").notNull().default(0),
  elapsedTimeS: integer("elapsed_time_s").notNull().default(0),
  maxElevationM: real("max_elevation_m"),
  geometry: jsonb("geometry").$type<LineString>().notNull(),
  track: jsonb("track").$type<TrackPoint[]>().notNull(),
  bbox: jsonb("bbox").$type<number[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Fotos – optional einer Tour zugeordnet. */
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => activities.id, {
    onDelete: "set null",
  }),
  blobUrl: text("blob_url").notNull(),
  caption: text("caption"),
  takenAt: timestamp("taken_at", { withTimezone: true }),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  source: text("source").$type<"strava" | "upload">().notNull().default("upload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Geplante Routen (Tourenplaner). */
export const plannedRoutes = pgTable("planned_routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  geometry: jsonb("geometry").$type<LineString>().notNull(),
  waypoints: jsonb("waypoints").$type<Array<[number, number]>>().notNull(),
  elevationProfile: jsonb("elevation_profile").$type<ElevationPoint[]>(),
  distanceM: real("distance_m").notNull().default(0),
  elevGainM: real("elev_gain_m").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Offizielles Rittner Wegenetz (aus OSM/Overpass). */
export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  osmId: text("osm_id").notNull().unique(),
  name: text("name"),
  ref: text("ref"),
  sacScale: text("sac_scale"),
  geometry: jsonb("geometry").$type<LineString>().notNull(),
  lengthM: real("length_m").notNull().default(0),
});

/** Points of Interest / Highlights. */
export const pois = pgTable("pois", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull().default("highlight"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  elevationM: real("elevation_m"),
  description: text("description"),
});

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Photo = typeof photos.$inferSelect;
export type PlannedRoute = typeof plannedRoutes.$inferSelect;
export type Trail = typeof trails.$inferSelect;
export type Poi = typeof pois.$inferSelect;
