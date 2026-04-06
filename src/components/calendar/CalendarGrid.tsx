"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
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

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export default function CalendarGrid({ currentDate, events }: CalendarGridProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  function getEventsForDay(day: Date) {
    return events.filter((event) => isSameDay(new Date(event.dateStart), day));
  }

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-gray-100">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-gray-400 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-gray-100">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] border-r border-b border-gray-100 p-1.5 ${
                !inMonth ? "bg-gray-50/50" : ""
              }`}
            >
              <div
                className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  today
                    ? "bg-gray-900 text-white"
                    : inMonth
                    ? "text-gray-700"
                    : "text-gray-300"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} {...event} compact />
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-xs text-gray-400 px-1.5">
                    +{dayEvents.length - 3} más
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
