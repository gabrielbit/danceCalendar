"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import WeekGrid from "@/components/calendar/WeekGrid";
import ListView from "@/components/calendar/ListView";
import MonthNav from "@/components/calendar/MonthNav";
import ViewToggle from "@/components/calendar/ViewToggle";
import TagFilter from "@/components/tags/TagFilter";
import TagOnboarding from "@/components/tags/TagOnboarding";

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  emoji: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  location?: string | null;
  price?: string | null;
  userName?: string | null;
  categories: { categoryId: number; name: string; color: string; emoji: string }[];
}

const TAG_COOKIE = "tag_preferences";

function getTagsFromCookie(): number[] | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TAG_COOKIE}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function setTagsCookie(ids: number[]) {
  const value = encodeURIComponent(JSON.stringify(ids));
  document.cookie = `${TAG_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function hasVisitedBefore(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.includes(`${TAG_COOKIE}=`);
}

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"calendar" | "week" | "list">("week");
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        // Check if first visit
        const saved = getTagsFromCookie();
        if (saved !== null) {
          setSelectedTags(saved);
        } else if (!hasVisitedBefore()) {
          setShowOnboarding(true);
        }
      });
  }, []);

  // Load events when month or filters change
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    let start: string;
    let end: string;

    if (view === "week") {
      start = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
      end = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
    } else {
      start = startOfMonth(currentDate).toISOString();
      end = endOfMonth(currentDate).toISOString();
    }

    const params = new URLSearchParams({ start, end });
    if (selectedTags.length > 0) {
      params.set("categories", selectedTags.join(","));
    }

    const res = await fetch(`/api/events?${params}`);
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }, [currentDate, selectedTags, view]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleOnboardingComplete(ids: number[]) {
    setTagsCookie(ids);
    setSelectedTags(ids);
    setShowOnboarding(false);
  }

  function handleToggleTag(id: number) {
    const next = selectedTags.includes(id)
      ? selectedTags.filter((x) => x !== id)
      : [...selectedTags, id];
    setSelectedTags(next);
    setTagsCookie(next);
  }

  function handleClearTags() {
    setSelectedTags([]);
    setTagsCookie([]);
  }

  return (
    <>
      {showOnboarding && (
        <TagOnboarding
          categories={categories}
          onComplete={handleOnboardingComplete}
        />
      )}

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <MonthNav currentDate={currentDate} onDateChange={setCurrentDate} view={view} />
          <ViewToggle view={view} onViewChange={setView} />
        </div>

        {/* Tag Filters */}
        {categories.length > 0 && (
          <div className="mb-6">
            <TagFilter
              categories={categories}
              selected={selectedTags}
              onToggle={handleToggleTag}
              onClear={handleClearTags}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : view === "calendar" ? (
          <CalendarGrid currentDate={currentDate} events={events} />
        ) : view === "week" ? (
          <WeekGrid currentDate={currentDate} events={events} />
        ) : (
          <ListView events={events} />
        )}
      </div>
    </>
  );
}
