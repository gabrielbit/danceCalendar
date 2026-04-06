"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "trusted" | "admin";
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  user: "Usuario",
  trusted: "Trusted",
  admin: "Admin",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-gray-100 text-gray-600",
  trusted: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  async function changeRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
      );
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400">
        <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Usuarios</h1>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 p-3"
          >
            <div className="min-w-0">
              <div className="font-medium text-gray-900 text-sm">
                {user.name || "Sin nombre"}
              </div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ROLE_COLORS[user.role]
                }`}
              >
                {ROLE_LABELS[user.role]}
              </span>
              <select
                value={user.role}
                onChange={(e) => changeRole(user.id, e.target.value)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600"
              >
                <option value="user">Usuario</option>
                <option value="trusted">Trusted</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
