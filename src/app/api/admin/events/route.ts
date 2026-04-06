import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      dateStart: events.dateStart,
      location: events.location,
      status: events.status,
      userName: users.name,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.status, "pending"))
    .orderBy(events.createdAt);

  return NextResponse.json(result);
}
