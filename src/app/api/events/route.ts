import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventCategories, categories, users } from "@/lib/db/schema";
import { and, eq, gte, lte, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const categoryIds = searchParams.get("categories");

  const conditions = [eq(events.status, "approved")];

  if (start) {
    conditions.push(gte(events.dateStart, new Date(start)));
  }
  if (end) {
    conditions.push(lte(events.dateStart, new Date(end)));
  }

  let eventIds: string[] | null = null;
  if (categoryIds) {
    const ids = categoryIds.split(",").map(Number).filter(Boolean);
    if (ids.length > 0) {
      const matchingEvents = await db
        .select({ eventId: eventCategories.eventId })
        .from(eventCategories)
        .where(inArray(eventCategories.categoryId, ids));
      eventIds = matchingEvents.map((e) => e.eventId);
      if (eventIds.length === 0) {
        return NextResponse.json([]);
      }
      conditions.push(inArray(events.id, eventIds));
    }
  }

  const result = await db
    .select({
      id: events.id,
      title: events.title,
      description: events.description,
      dateStart: events.dateStart,
      dateEnd: events.dateEnd,
      location: events.location,
      imageUrl: events.imageUrl,
      price: events.price,
      paymentInfo: events.paymentInfo,
      contactInfo: events.contactInfo,
      recurrenceType: events.recurrenceType,
      userId: events.userId,
      userName: users.name,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(and(...conditions))
    .orderBy(events.dateStart);

  // Fetch categories for each event
  const eventIdsFromResult = result.map((e) => e.id);
  let eventCats: { eventId: string; categoryId: number; name: string; slug: string; color: string; emoji: string }[] = [];

  if (eventIdsFromResult.length > 0) {
    eventCats = await db
      .select({
        eventId: eventCategories.eventId,
        categoryId: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
        emoji: categories.emoji,
      })
      .from(eventCategories)
      .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
      .where(inArray(eventCategories.eventId, eventIdsFromResult));
  }

  const eventsWithCategories = result.map((event) => ({
    ...event,
    categories: eventCats.filter((ec) => ec.eventId === event.id),
  }));

  return NextResponse.json(eventsWithCategories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const {
    title,
    description,
    dateStart,
    dateEnd,
    location,
    price,
    paymentInfo,
    contactInfo,
    recurrenceType,
    categoryIds,
  } = body;

  if (!title || !dateStart) {
    return NextResponse.json(
      { error: "Título y fecha de inicio son obligatorios" },
      { status: 400 }
    );
  }

  const userRole = session.user.role;
  const status = userRole === "trusted" || userRole === "admin" ? "approved" : "pending";

  const [newEvent] = await db
    .insert(events)
    .values({
      title,
      description,
      dateStart: new Date(dateStart),
      dateEnd: dateEnd ? new Date(dateEnd) : null,
      location,
      price,
      paymentInfo,
      contactInfo,
      recurrenceType: recurrenceType || "none",
      status,
      userId: session.user.id,
    })
    .returning();

  // Insert event-category relations
  if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
    await db.insert(eventCategories).values(
      categoryIds.map((catId: number) => ({
        eventId: newEvent.id,
        categoryId: catId,
      }))
    );
  }

  return NextResponse.json(newEvent, { status: 201 });
}
