import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const result = await db
    .select()
    .from(categories)
    .orderBy(categories.sortOrder);

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { name, slug, color, emoji } = await request.json();

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Nombre y slug son obligatorios" },
      { status: 400 }
    );
  }

  const [newCat] = await db
    .insert(categories)
    .values({ name, slug, color: color || "#3498DB", emoji: emoji || "" })
    .returning();

  return NextResponse.json(newCat, { status: 201 });
}
