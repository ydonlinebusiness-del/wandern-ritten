CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"strava_id" text,
	"name" text NOT NULL,
	"type" text DEFAULT 'Hike' NOT NULL,
	"start_date" timestamp with time zone,
	"distance_m" real DEFAULT 0 NOT NULL,
	"elev_gain_m" real DEFAULT 0 NOT NULL,
	"moving_time_s" integer DEFAULT 0 NOT NULL,
	"elapsed_time_s" integer DEFAULT 0 NOT NULL,
	"max_elevation_m" real,
	"geometry" jsonb NOT NULL,
	"track" jsonb NOT NULL,
	"bbox" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer,
	"blob_url" text NOT NULL,
	"caption" text,
	"taken_at" timestamp with time zone,
	"lat" double precision,
	"lng" double precision,
	"source" text DEFAULT 'upload' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planned_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"geometry" jsonb NOT NULL,
	"waypoints" jsonb NOT NULL,
	"elevation_profile" jsonb,
	"distance_m" real DEFAULT 0 NOT NULL,
	"elev_gain_m" real DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pois" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'highlight' NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"elevation_m" real,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "strava_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trails" (
	"id" serial PRIMARY KEY NOT NULL,
	"osm_id" text NOT NULL,
	"name" text,
	"ref" text,
	"sac_scale" text,
	"geometry" jsonb NOT NULL,
	"length_m" real DEFAULT 0 NOT NULL,
	CONSTRAINT "trails_osm_id_unique" UNIQUE("osm_id")
);
--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;