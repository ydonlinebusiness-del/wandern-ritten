import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "./client";
import type { Activity, NewActivity } from "./schema";

export async function listActivities(): Promise<Activity[]> {
  const db = getDb();
  return db.select().from(schema.activities).orderBy(desc(schema.activities.startDate));
}

export async function getActivity(id: number): Promise<Activity | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.activities)
    .where(eq(schema.activities.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertActivity(a: NewActivity): Promise<Activity> {
  const db = getDb();
  const rows = await db.insert(schema.activities).values(a).returning();
  return rows[0];
}

/** True, wenn eine Strava-Aktivität mit dieser ID schon existiert. */
export async function stravaActivityExists(stravaId: string): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select({ id: schema.activities.id })
    .from(schema.activities)
    .where(eq(schema.activities.stravaId, stravaId))
    .limit(1);
  return rows.length > 0;
}

export async function listPhotosForActivity(activityId: number) {
  const db = getDb();
  return db
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.activityId, activityId))
    .orderBy(desc(schema.photos.takenAt));
}

export async function listTrails() {
  const db = getDb();
  return db.select().from(schema.trails);
}

export async function listPois() {
  const db = getDb();
  return db.select().from(schema.pois);
}

export async function listPlannedRoutes() {
  const db = getDb();
  return db
    .select()
    .from(schema.plannedRoutes)
    .orderBy(desc(schema.plannedRoutes.createdAt));
}
