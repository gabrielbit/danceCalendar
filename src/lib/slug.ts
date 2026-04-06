import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export function nameToSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function generateUniqueSlug(name: string): Promise<string> {
  const base = nameToSlug(name);
  if (!base) return `user-${Date.now()}`;

  const [existing] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.slug, base));

  if (Number(existing.count) === 0) return base;

  let suffix = 2;
  while (true) {
    const candidate = `${base}-${suffix}`;
    const [check] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.slug, candidate));
    if (Number(check.count) === 0) return candidate;
    suffix++;
  }
}
