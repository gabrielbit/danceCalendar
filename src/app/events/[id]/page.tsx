import { db } from "@/lib/db";
import { events, eventCategories, categories, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const [event] = await db
    .select({ title: events.title, description: events.description, dateStart: events.dateStart, location: events.location, imageUrl: events.imageUrl })
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) return { title: "Evento no encontrado" };

  const dateStr = format(event.dateStart, "d 'de' MMMM yyyy · HH:mm", { locale: es });
  const desc = [dateStr, event.location].filter(Boolean).join(" — ");

  return {
    title: `${event.title} — mover`,
    description: event.description?.replace(/<[^>]*>/g, "").slice(0, 160) || desc,
    openGraph: {
      title: event.title,
      description: desc,
      type: "website",
      ...(event.imageUrl && { images: [{ url: event.imageUrl }] }),
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
      userImage: users.image,
    })
    .from(events)
    .leftJoin(users, eq(events.userId, users.id))
    .where(eq(events.id, id))
    .limit(1);

  if (!event) notFound();

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
    weekly: "Semanal",
    biweekly: "Quincenal",
    monthly: "Mensual",
  };

  const MODALITY_LABELS: Record<string, string> = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrido: "Híbrido",
  };

  const formattedPrice = formatPrice(event.price);

  const now = new Date();
  const eventDate = new Date(event.dateStart);
  const isPast = eventDate < now;
  const diffMs = eventDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let countdownText = "";
  if (isPast) {
    countdownText = "Evento finalizado";
  } else if (diffDays > 0) {
    countdownText = `En ${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    countdownText = `En ${diffHours}h ${diffMinutes}min`;
  } else {
    countdownText = `En ${diffMinutes} minutos`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status banner */}
      {event.status !== "approved" && (
        <div
          className={`text-center text-sm py-2 ${
            event.status === "pending"
              ? "bg-yellow-50 text-yellow-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {event.status === "pending"
            ? "Este evento está pendiente de aprobación"
            : "Este evento fue rechazado"}
        </div>
      )}

      {/* Hero image */}
      {event.imageUrl ? (
        <div className="w-full max-h-[400px] overflow-hidden bg-gray-200">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="w-full h-48 sm:h-64"
          style={{
            background: `linear-gradient(135deg, ${eventCats[0]?.color || "#6366f1"}22, ${eventCats[0]?.color || "#6366f1"}08)`,
          }}
        />
      )}

      <div className="mx-auto max-w-4xl px-4 -mt-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title card */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-3">
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

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {event.title}
              </h1>

              {/* Date & location row */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-50 flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-orange-600 uppercase leading-none">
                      {format(event.dateStart, "MMM", { locale: es })}
                    </span>
                    <span className="text-lg font-bold text-orange-700 leading-none">
                      {format(event.dateStart, "d")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {format(event.dateStart, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(event.dateStart, "HH:mm")}
                      {event.dateEnd && ` – ${format(event.dateEnd, "HH:mm")} hs`}
                      {event.recurrenceType !== "none" && (
                        <span className="ml-2 text-gray-400">
                          · {RECURRENCE_LABELS[event.recurrenceType]}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.location}</p>
                      {event.modality !== "presencial" && (
                        <span className="inline-block mt-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                          {MODALITY_LABELS[event.modality]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!event.location && event.modality !== "presencial" && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-900">{MODALITY_LABELS[event.modality]}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {event.description && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sobre este evento</h2>
                <div
                  className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              </div>
            )}

            {/* Payment info */}
            {event.paymentInfo && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Cómo pagar</h2>
                <p className="text-sm text-gray-600 whitespace-pre-line">{event.paymentInfo}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Countdown + Price card */}
            <div className="rounded-xl bg-white p-6 shadow-sm text-center space-y-3">
              <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                isPast
                  ? "bg-gray-100 text-gray-500"
                  : diffDays === 0
                  ? "bg-orange-50 text-orange-600"
                  : "bg-green-50 text-green-600"
              }`}>
                {isPast ? (
                  <span>{countdownText}</span>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                    </span>
                    {countdownText}
                  </>
                )}
              </div>
              {formattedPrice && (
                <>
                  <p className="text-3xl font-bold text-gray-900">{formattedPrice}</p>
                  <p className="text-sm text-gray-400">por persona</p>
                </>
              )}
            </div>

            {/* Organizer card */}
            {event.userName && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <p className="text-xs font-medium text-gray-400 uppercase mb-3">Organiza</p>
                <div className="flex items-center gap-3">
                  {event.userImage ? (
                    <img src={event.userImage} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
                      {event.userName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    {event.userSlug ? (
                      <Link
                        href={`/organizador/${event.userSlug}`}
                        className="font-medium text-gray-900 hover:underline underline-offset-2"
                      >
                        {event.userName}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-900">{event.userName}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact card */}
            {(event.instagram || event.whatsapp || event.website) && (
              <div className="rounded-xl bg-white p-6 shadow-sm space-y-3">
                <p className="text-xs font-medium text-gray-400 uppercase">Contacto</p>
                {event.instagram && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-gray-700">{event.instagram}</span>
                  </div>
                )}
                {event.whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-gray-700">{event.whatsapp}</span>
                  </div>
                )}
                {event.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                    </svg>
                    <span className="text-gray-700">{event.website}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {(isOwner || isAdmin) && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="block w-full text-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Editar evento
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
