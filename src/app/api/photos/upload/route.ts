import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getDb, schema } from "@/db/client";

export const maxDuration = 60;

/** Lädt ein Foto nach Vercel Blob und legt einen photos-Eintrag an. */
export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN ist nicht konfiguriert (Vercel Blob)." },
      { status: 500 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei erhalten." }, { status: 400 });
  }
  const activityId = form.get("activityId")
    ? Number(form.get("activityId"))
    : null;
  const caption = form.get("caption") ? String(form.get("caption")) : null;

  const blob = await put(`photos/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const db = getDb();
  const rows = await db
    .insert(schema.photos)
    .values({
      activityId: activityId ?? undefined,
      blobUrl: blob.url,
      caption: caption ?? undefined,
      source: "upload",
    })
    .returning();

  return NextResponse.json({ photo: rows[0] });
}
