import EventCard from "./EventCard";

interface CalendarEvent {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: string | null;
  userName?: string | null;
  categories: { categoryId: number; name: string; color: string; emoji: string }[];
}

interface ListViewProps {
  events: CalendarEvent[];
}

export default function ListView({ events }: ListViewProps) {
  if (events.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-lg">No hay eventos para mostrar</p>
        <p className="text-sm mt-1">Probá ajustando los filtros o el rango de fechas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}
