import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <nav className="sm:w-48 shrink-0">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Admin
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/events"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Eventos pendientes
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Usuarios
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Categorías
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
