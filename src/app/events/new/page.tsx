import EventForm from "@/components/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Crear evento</h1>
      <EventForm mode="create" />
    </div>
  );
}
