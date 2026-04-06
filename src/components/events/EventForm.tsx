"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface Category {
  id: number;
  name: string;
  color: string;
  emoji: string;
}

interface EventFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    dateStart?: string;
    dateEnd?: string;
    location?: string;
    price?: string;
    paymentInfo?: string;
    instagram?: string;
    whatsapp?: string;
    website?: string;
    modality?: string;
    recurrenceType?: string;
    categoryIds?: number[];
  };
  mode: "create" | "edit";
}

export default function EventForm({ initialData, mode }: EventFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dateStart, setDateStart] = useState(initialData?.dateStart || "");
  const [dateEnd, setDateEnd] = useState(initialData?.dateEnd || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [price, setPrice] = useState(initialData?.price || "");
  const [paymentInfo, setPaymentInfo] = useState(initialData?.paymentInfo || "");
  const [instagram, setInstagram] = useState(initialData?.instagram || "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [modality, setModality] = useState(initialData?.modality || "presencial");
  const [recurrenceType, setRecurrenceType] = useState(initialData?.recurrenceType || "none");
  const [selectedCats, setSelectedCats] = useState<number[]>(initialData?.categoryIds || []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function toggleCategory(id: number) {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      title,
      description,
      dateStart,
      dateEnd: dateEnd || null,
      location,
      price,
      paymentInfo,
      instagram,
      whatsapp,
      website,
      modality,
      recurrenceType,
      categoryIds: selectedCats,
    };

    const url =
      mode === "edit" ? `/api/events/${initialData?.id}` : "/api/events";
    const method = mode === "edit" ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar el evento");
      return;
    }

    const event = await res.json();
    router.push(`/events/${event.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Título *
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="Nombre del evento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <RichTextEditor
          content={description}
          onChange={setDescription}
          placeholder="Contá de qué se trata... usá emojis, negritas, listas..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700">
            Fecha y hora de inicio *
          </label>
          <input
            id="dateStart"
            type="datetime-local"
            required
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
        <div>
          <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700">
            Fecha y hora de fin
          </label>
          <input
            id="dateEnd"
            type="datetime-local"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Ubicación
        </label>
        <input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder="Dirección o nombre del lugar"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Precio
        </label>
        <div className="mt-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="19000"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Solo el número, sin puntos ni signos. Dejá vacío si es gratis o a voluntad.</p>
      </div>

      <div>
        <label htmlFor="paymentInfo" className="block text-sm font-medium text-gray-700">
          Cómo pagar
        </label>
        <textarea
          id="paymentInfo"
          rows={2}
          value={paymentInfo}
          onChange={(e) => setPaymentInfo(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          placeholder={"Alias: mi.alias.mp\nCBU: 000000000000\nLink: passline.com/mi-evento"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contacto
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="@instagram"
          />
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="WhatsApp (ej: 1155554444)"
          />
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            placeholder="Sitio web"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="modality" className="block text-sm font-medium text-gray-700">
            Modalidad
          </label>
          <select
            id="modality"
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="hibrido">Híbrido</option>
          </select>
        </div>
        <div>
          <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">
            Recurrencia
          </label>
          <select
            id="recurrence"
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          >
            <option value="none">Evento único</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quincenal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorías
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCats.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border transition-all ${
                  isSelected
                    ? "border-transparent text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={isSelected ? { backgroundColor: cat.color } : {}}
              >
                {cat.emoji} {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading
          ? "Guardando..."
          : mode === "edit"
          ? "Actualizar evento"
          : "Publicar evento"}
      </button>

      {mode === "create" && (
        <p className="text-xs text-gray-400 text-center">
          Tu evento será revisado por un administrador antes de publicarse.
        </p>
      )}
    </form>
  );
}
