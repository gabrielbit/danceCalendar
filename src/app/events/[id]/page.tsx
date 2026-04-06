import { db } from "@/lib/db";
import { events, eventCategories, categories, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [event] = await db
    .select({ title: events.title, description: events.description, dateStart: events.dateStart, location: events.location })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) return { title: "Evento no encontrado" };

  const dateStr = format(event.dateStart, "d 'de' MMMM yyyy · HH:mm", { locale: es });
  const desc = [dateStr, event.location].filter(Boolean).join(" — ");

  return {
    title: event.title,
    description: event.description || desc,
    openGraph: {
      title: event.title,
      description: desc,
      type: "website",
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

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
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!event) notFound();

  // Only show approved events publicly, or own events, or admin
  const isOwner = session?.user?.id === event.userId;
  const isAdmin = session?.user?.role === "admin";
  if (event.status !== "approved" && !isOwner && !isAdmin) {
    notFound();
  }

  const eventCats = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      emoji: categories.emoji,
    })
    .from(eventCategories)
    .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
    .where(eq(eventCategories.eventId, id));

  const RECURRENCE_LABELS: Record<string, string> = {
    none: "Evento único",
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
  };

  const MODALITY_LABELS: Record<string, string> = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {event.status !== "approved" && (
        <div
          className={`mb-4 rounded-lg px-4 py-2 text-sm ${
            event.status === "pending"
              ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {event.status === "pending"
            ? "Este evento está pendiente de aprobación"
            : "Este evento fue rechazado"}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {eventCats.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
            >
              {cat.emoji} {cat.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-semibold text-gray-900">{event.title}</h1>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <time className="capitalize">
              {format(event.dateStart, "EEEE d 'de' MMMM, yyyy · HH:mm", { locale: es })}
              {event.dateEnd && ` – ${format(event.dateEnd, "HH:mm")}`}
            </time>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {event.location}
              {event.modality !== "presencial" && (
                <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  {MODALITY_LABELS[event.modality]}
                </span>
              )}
            </div>
          )}

          {!event.location && event.modality !== "presencial" && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              {MODALITY_LABELS[event.modality]}
            </div>
          )}

          {event.recurrenceType !== "none" && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              {RECURRENCE_LABELS[event.recurrenceType]}
            </div>
          )}
        </div>

        {event.description && (
          <div className="prose prose-sm prose-gray mt-4 whitespace-pre-wrap">
            {event.description}
          </div>
        )}

        <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4">
          {event.price && (
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase">Precio</span>
              <p className="text-sm text-gray-700">{event.price}</p>
            </div>
          )}
          {event.paymentInfo && (
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase">Pago</span>
              <p className="text-sm text-gray-700">{event.paymentInfo}</p>
            </div>
          )}
          {(event.instagram || event.whatsapp || event.website) && (
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase">Contacto</span>
              <div className="flex flex-wrap gap-3 mt-1">
                {event.instagram && (
                  <span className="text-sm text-gray-700">
                    IG: {event.instagram}
                  </span>
                )}
                {event.whatsapp && (
                  <span className="text-sm text-gray-700">
                    WA: {event.whatsapp}
                  </span>
                )}
                {event.website && (
                  <span className="text-sm text-gray-700">
                    Web: {event.website}
                  </span>
                )}
              </div>
            </div>
          )}
          {event.userName && (
            <div>
              <span className="text-xs font-medium text-gray-400 uppercase">Organiza</span>
              {event.userSlug ? (
                <Link href={`/organizador/${event.userSlug}`} className="block text-sm text-gray-700 hover:text-gray-900 underline underline-offset-2">
                  {event.userName}
                </Link>
              ) : (
                <p className="text-sm text-gray-700">{event.userName}</p>
              )}
            </div>
          )}
        </div>

        {(isOwner || isAdmin) && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <Link
              href={`/events/${event.id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Editar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
