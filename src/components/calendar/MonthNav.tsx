"use client";

import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface MonthNavProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view?: "calendar" | "week" | "list";
}

export default function MonthNav({ currentDate, onDateChange, view = "calendar" }: MonthNavProps) {
  const isWeek = view === "week";

  function goBack() {
    onDateChange(isWeek ? subWeeks(currentDate, 1) : subMonths(currentDate, 1));
  }

  function goForward() {
    onDateChange(isWeek ? addWeeks(currentDate, 1) : addMonths(currentDate, 1));
  }

  function getLabel() {
    if (isWeek) {
      const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
      const we = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(ws, "d MMM", { locale: es })} – ${format(we, "d MMM yyyy", { locale: es })}`;
    }
    return format(currentDate, "MMMM yyyy", { locale: es });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={goBack}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        aria-label="Anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <h2 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center capitalize">
        {getLabel()}
      </h2>

      <button
        onClick={goForward}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        aria-label="Siguiente"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <button
        onClick={() => onDateChange(new Date())}
        className="ml-1 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        Hoy
      </button>
    </div>
  );
}
