"use client";

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

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

interface WeekGridProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export default function WeekGrid({ currentDate, events }: WeekGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  function getEventsForDay(day: Date) {
    return events
      .filter((event) => isSameDay(new Date(event.dateStart), day))
      .sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());
  }

  return (
    <div className="grid grid-cols-7 border-l border-t border-gray-100">
      {days.map((day) => {
        const dayEvents = getEventsForDay(day);
        const today = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className="min-h-[300px] border-r border-b border-gray-100 flex flex-col"
          >
            <div className={`px-2 py-2 text-center border-b border-gray-50 ${today ? "bg-gray-900" : "bg-gray-50/50"}`}>
              <div className={`text-xs uppercase ${today ? "text-gray-300" : "text-gray-400"}`}>
                {format(day, "EEE", { locale: es })}
              </div>
              <div className={`text-lg font-semibold ${today ? "text-white" : "text-gray-900"}`}>
                {format(day, "d")}
              </div>
            </div>

            <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
              {dayEvents.map((event) => {
                const start = new Date(event.dateStart);
                const emojis = event.categories.map((c) => c.emoji).join("");
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block rounded-lg p-2 text-xs hover:bg-gray-50 transition-colors"
                    style={{
                      borderLeft: `3px solid ${event.categories[0]?.color || "#94a3b8"}`,
                    }}
                  >
                    <div className="font-medium text-gray-900">
                      {format(start, "HH:mm")}
                      {event.dateEnd && ` – ${format(new Date(event.dateEnd), "HH:mm")}`}
                      {emojis && <span className="ml-1">{emojis}</span>}
                    </div>
                    <div className="text-gray-700 mt-0.5 line-clamp-2">{event.title}</div>
                    {event.location && (
                      <div className="text-gray-400 mt-0.5 truncate">{event.location}</div>
                    )}
                  </Link>
                );
              })}
              {dayEvents.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <span className="text-gray-200 text-xs">—</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
