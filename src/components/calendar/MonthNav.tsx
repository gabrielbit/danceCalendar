"use client";

import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface MonthNavProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export default function MonthNav({ currentDate, onDateChange }: MonthNavProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onDateChange(subMonths(currentDate, 1))}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        aria-label="Mes anterior"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <h2 className="text-lg font-semibold text-gray-900 min-w-[160px] text-center capitalize">
        {format(currentDate, "MMMM yyyy", { locale: es })}
      </h2>

      <button
        onClick={() => onDateChange(addMonths(currentDate, 1))}
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        aria-label="Mes siguiente"
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
