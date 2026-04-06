import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events, eventCategories, categories, users } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [event] = await db
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
      instagram: events.instagram,
      whatsapp: events.whatsapp,
      website: events.website,
      modality: events.modality,
      recurrenceType: events.recurrenceType,
      status: events.status,
      userId: events.userId,
      userName: users.name,
      userSlug: users.slug,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  const eventCats = await db
    .select({
      categoryId: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
      emoji: categories.emoji,
    })
    .from(eventCategories)
    .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(eq(eventCategories.eventId, id));

  return NextResponse.json({ ...event, categories: eventCats });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ userId: events.userId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  if (existing.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "No tenés permiso" }, { status: 403 });
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
    instagram,
    whatsapp,
    website,
    modality,
    recurrenceType,
    categoryIds,
  } = body;

  const [updated] = await db
    .update(events)
    .set({
      title,
      description,
      dateStart: dateStart ? new Date(dateStart) : undefined,
      dateEnd: dateEnd ? new Date(dateEnd) : null,
      location,
      price,
      paymentInfo,
      instagram,
      whatsapp,
      website,
      modality: modality || "presencial",
      recurrenceType: recurrenceType || "none",
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  // Update categories
  if (categoryIds && Array.isArray(categoryIds)) {
    await db.delete(eventCategories).where(eq(eventCategories.eventId, id));
    if (categoryIds.length > 0) {
      await db.insert(eventCategories).values(
        categoryIds.map((catId: number) => ({
          eventId: id,
          categoryId: catId,
        }))
      );
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const [existing] = await db
    .select({ userId: events.userId })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  if (existing.userId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "No tenés permiso" }, { status: 403 });
  }

  await db.delete(events).where(eq(events.id, id));
  return NextResponse.json({ ok: true });
}
