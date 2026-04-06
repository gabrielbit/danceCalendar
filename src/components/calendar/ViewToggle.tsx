"use client";

interface ViewToggleProps {
  view: "calendar" | "list";
  onViewChange: (view: "calendar" | "list") => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
      <button
        onClick={() => onViewChange("calendar")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          view === "calendar"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        Mes
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          view === "list"
            ? "bg-gray-900 text-white"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Lista
      </button>
    </div>
  );
}
