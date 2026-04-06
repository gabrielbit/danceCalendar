"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import EventForm from "@/components/events/EventForm";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  dateStart: string;
  dateEnd: string | null;
  location: string | null;
  price: string | null;
  paymentInfo: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  modality: string;
  recurrenceType: string;
  categories: { categoryId: number }[];
}

export default function EditEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setEvent(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 text-center text-gray-400">
        Evento no encontrado
      </div>
    );
  }

  // Format datetime-local value
  const formatForInput = (date: string) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar evento</h1>
      <EventForm
        mode="edit"
        initialData={{
          id: event.id,
          title: event.title,
          description: event.description || "",
          dateStart: formatForInput(event.dateStart),
          dateEnd: event.dateEnd ? formatForInput(event.dateEnd) : "",
          location: event.location || "",
          price: event.price || "",
          paymentInfo: event.paymentInfo || "",
          instagram: event.instagram || "",
          whatsapp: event.whatsapp || "",
          website: event.website || "",
          modality: event.modality,
          recurrenceType: event.recurrenceType,
          categoryIds: event.categories.map((c) => c.categoryId),
        }}
      />
    </div>
  );
}
