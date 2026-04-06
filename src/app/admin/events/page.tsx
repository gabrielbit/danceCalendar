"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface PendingEvent {
  id: string;
  title: string;
  dateStart: string;
  location: string | null;
  userName: string | null;
  status: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    setLoading(true);
    const res = await fetch("/api/events?status=pending");
    // The public API only returns approved, so we use a different approach
    // For now, fetch all and filter client-side (will improve with admin API)
    const res2 = await fetch("/api/admin/events");
    if (res2.ok) {
      const data = await res2.json();
      setEvents(data);
    }
    setLoading(false);
  }

  async function handleAction(eventId: string, status: "approved" | "rejected") {
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Eventos pendientes
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-400">No hay eventos pendientes de aprobación.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border border-gray-100 p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/events/${event.id}`}
                  className="font-medium text-gray-900 hover:underline"
                >
                  {event.title}
                </Link>
                <div className="text-sm text-gray-500">
                  {format(new Date(event.dateStart), "d MMM yyyy · HH:mm", {
                    locale: es,
                  })}
                  {event.location && ` · ${event.location}`}
                </div>
                {event.userName && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    por {event.userName}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleAction(event.id, "approved")}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleAction(event.id, "rejected")}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
