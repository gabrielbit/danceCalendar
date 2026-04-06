"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  emoji: string;
}

interface TagOnboardingProps {
  categories: Category[];
  onComplete: (selectedIds: number[]) => void;
}

export default function TagOnboarding({
  categories,
  onComplete,
}: TagOnboardingProps) {
  const [selected, setSelected] = useState<number[]>([]);

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          ¿Qué te mueve?
        </h2>
        <p className="mt-1 text-sm text-gray-500 text-center">
          Elegí las disciplinas que te interesan para filtrar el calendario
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => {
            const isSelected = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium border-2 transition-all ${
                  isSelected
                    ? "border-transparent text-white scale-105"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : {}
                }
              >
                <span>{cat.emoji}</span>
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => onComplete(selected)}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            {selected.length > 0
              ? `Guardar ${selected.length} selección${selected.length > 1 ? "es" : ""}`
              : "Ver todo"}
          </button>
          <button
            onClick={() => onComplete([])}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Saltar, mostrame todo
          </button>
        </div>
      </div>
    </div>
  );
}
