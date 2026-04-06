import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatPrice } from "@/lib/format";

interface EventCategory {
  categoryId: number;
  name: string;
  color: string;
  emoji: string;
}

interface EventCardProps {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: string | null;
  userName?: string | null;
  categories: EventCategory[];
  compact?: boolean;
}

export default function EventCard({
  id,
  title,
  dateStart,
  dateEnd,
  location,
  price,
  userName,
  categories: cats,
  compact = false,
}: EventCardProps) {
  const start = new Date(dateStart);

  if (compact) {
    const emojis = cats.map((c) => c.emoji).join("");
    return (
      <Link
        href={`/events/${id}`}
        className="block rounded-md px-1.5 py-0.5 text-xs leading-tight hover:bg-gray-50 transition-colors truncate"
        style={{
          borderLeft: `3px solid ${cats[0]?.color || "#94a3b8"}`,
        }}
      >
        <span className="font-medium">{format(start, "HH:mm")}</span>
        {emojis && <span className="ml-0.5">{emojis}</span>}{" "}
        <span className="text-gray-600">{title}</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${id}`}
      className="block rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <time dateTime={dateStart}>
              {format(start, "EEEE d MMM · HH:mm", { locale: es })}
              {dateEnd && ` – ${format(new Date(dateEnd), "HH:mm")}`}
            </time>
          </div>
          <h3 className="font-medium text-gray-900 truncate">{title}</h3>
          {location && (
            <p className="text-sm text-gray-500 mt-0.5 truncate">{location}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {cats.map((cat) => (
              <span
                key={cat.categoryId}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.emoji} {cat.name}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-semibold text-gray-900">
            {format(start, "d")}
          </div>
          <div className="text-xs text-gray-400 uppercase">
            {format(start, "MMM", { locale: es })}
          </div>
        </div>
      </div>
      {(price || userName) && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
          {userName && <span>por {userName}</span>}
          {price && <span className="font-medium text-gray-600">{formatPrice(price)}</span>}
        </div>
      )}
    </Link>
  );
}
