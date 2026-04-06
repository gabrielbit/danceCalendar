import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.active, true))
    .orderBy(categories.sortOrder);

  return NextResponse.json(result);
}
