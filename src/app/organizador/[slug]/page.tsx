import { db } from "@/lib/db";
import { users, events, eventCategories, categories } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [user] = await db
    .select({ name: users.name, bio: users.bio })
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);

  if (!user) return { title: "Organizador no encontrado" };

  return {
    title: `${user.name} — Eventos`,
    description: user.bio || `Eventos organizados por ${user.name}`,
    openGraph: {
      title: `${user.name} — Eventos`,
      description: user.bio || `Eventos organizados por ${user.name}`,
      type: "profile",
    },
  };
}

export default async function OrganizerProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [organizer] = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      bio: users.bio,
      instagram: users.instagram,
      whatsapp: users.whatsapp,
      website: users.website,
    })
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);

  if (!organizer) notFound();

  const organizerEvents = await db
    .select({
      id: events.id,
      title: events.title,
      dateStart: events.dateStart,
      dateEnd: events.dateEnd,
      location: events.location,
      modality: events.modality,
    })
    .from(events)
    .where(and(eq(events.userId, organizer.id), eq(events.status, "approved")))
    .orderBy(events.dateStart);

  const eventIds = organizerEvents.map((e) => e.id);
  let eventCats: { eventId: string; categoryId: number; name: string; color: string; emoji: string }[] = [];
  if (eventIds.length > 0) {
    eventCats = await db
      .select({
        eventId: eventCategories.eventId,
        categoryId: categories.id,
        name: categories.name,
        color: categories.color,
        emoji: categories.emoji,
      })
      .from(eventCategories)
      .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
      .where(inArray(eventCategories.eventId, eventIds));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start gap-4 mb-8">
        {organizer.image ? (
          <img
            src={organizer.image}
            alt={organizer.name || ""}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl text-gray-400">
            {organizer.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-900">{organizer.name}</h1>
          {organizer.bio && (
            <p className="mt-1 text-sm text-gray-600">{organizer.bio}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {organizer.instagram && (
              <span className="text-xs text-gray-500">IG: {organizer.instagram}</span>
            )}
            {organizer.whatsapp && (
              <span className="text-xs text-gray-500">WA: {organizer.whatsapp}</span>
            )}
            {organizer.website && (
              <span className="text-xs text-gray-500">Web: {organizer.website}</span>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Eventos ({organizerEvents.length})
      </h2>

      {organizerEvents.length === 0 ? (
        <p className="text-sm text-gray-400">Este organizador aún no tiene eventos publicados.</p>
      ) : (
        <div className="space-y-3">
          {organizerEvents.map((event) => {
            const cats = eventCats.filter((ec) => ec.eventId === event.id);
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {cats.map((cat) => (
                    <span
                      key={cat.categoryId}
                      className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      {cat.emoji} {cat.name}
                    </span>
                  ))}
                </div>
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500 mt-0.5 capitalize">
                  {format(event.dateStart, "EEEE d 'de' MMMM · HH:mm", { locale: es })}
                  {event.dateEnd && ` – ${format(event.dateEnd, "HH:mm")}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-400">
                  {event.location && <span>{event.location}</span>}
                  {event.modality !== "presencial" && (
                    <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                      {event.modality === "virtual" ? "Virtual" : "Híbrido"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
