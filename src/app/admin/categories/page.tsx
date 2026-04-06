"use client";

import { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  emoji: string;
  sortOrder: number;
  active: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", color: "#3498DB", emoji: "" });
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function handleSave() {
    const url = editingId
      ? `/api/admin/categories/${editingId}`
      : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setEditingId(null);
      setShowNew(false);
      setForm({ name: "", slug: "", color: "#3498DB", emoji: "" });
      fetchCategories();
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, color: cat.color, emoji: cat.emoji });
    setShowNew(false);
  }

  async function toggleActive(cat: Category) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, active: !cat.active }),
    });
    fetchCategories();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Categorías</h1>
        <button
          onClick={() => {
            setShowNew(true);
            setEditingId(null);
            setForm({ name: "", slug: "", color: "#3498DB", emoji: "" });
          }}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          + Nueva
        </button>
      </div>

      {(showNew || editingId !== null) && (
        <div className="mb-6 rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                  slug: editingId
                    ? form.slug
                    : e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                })
              }
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="rounded-lg border border-gray-300 h-9 w-full"
            />
            <input
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              {editingId ? "Actualizar" : "Crear"}
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setShowNew(false);
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${
              cat.active ? "border-gray-100" : "border-gray-100 opacity-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm">
                {cat.emoji} {cat.name}
              </span>
              <span className="text-xs text-gray-400">/{cat.slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(cat)}
                className={`text-xs px-2 py-0.5 rounded ${
                  cat.active
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {cat.active ? "Activa" : "Inactiva"}
              </button>
              <button
                onClick={() => startEdit(cat)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
