import { db } from "@/lib/db";
import { events, users } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const [pendingCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "pending"));

  const [approvedCount] = await db
    .select({ count: count() })
    .from(events)
    .where(eq(events.status, "approved"));

  const [userCount] = await db.select({ count: count() }).from(users);

  const stats = [
    {
      label: "Eventos pendientes",
      value: pendingCount.count,
      href: "/admin/events",
      highlight: pendingCount.count > 0,
    },
    {
      label: "Eventos publicados",
      value: approvedCount.count,
      href: "#",
      highlight: false,
    },
    {
      label: "Usuarios",
      value: userCount.count,
      href: "/admin/users",
      highlight: false,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`rounded-lg border p-4 transition-colors ${
              stat.highlight
                ? "border-yellow-200 bg-yellow-50 hover:border-yellow-300"
                : "border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="text-3xl font-semibold text-gray-900">
              {stat.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
