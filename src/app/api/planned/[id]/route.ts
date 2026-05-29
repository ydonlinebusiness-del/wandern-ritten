import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();
  await db.delete(schema.plannedRoutes).where(eq(schema.plannedRoutes.id, Number(id)));
  return NextResponse.json({ ok: true });
}
