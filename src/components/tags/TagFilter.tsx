"use client";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  emoji: string;
}

interface TagFilterProps {
  categories: Category[];
  selected: number[];
  onToggle: (categoryId: number) => void;
  onClear: () => void;
}

export default function TagFilter({
  categories,
  selected,
  onToggle,
  onClear,
}: TagFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((cat) => {
        const isSelected = selected.includes(cat.id);
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border transition-all ${
              isSelected
                ? "border-transparent text-white shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
            style={
              isSelected
                ? { backgroundColor: cat.color }
                : {}
            }
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </button>
        );
      })}
      {selected.length > 0 && (
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-gray-600 ml-1"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
