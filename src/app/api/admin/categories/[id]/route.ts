import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(categories)
    .set({
      name: body.name,
      slug: body.slug,
      color: body.color,
      emoji: body.emoji,
      active: body.active,
    })
    .where(eq(categories.id, parseInt(id)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
