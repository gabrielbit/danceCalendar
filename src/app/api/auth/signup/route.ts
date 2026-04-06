import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateUniqueSlug } from "@/lib/slug";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const slug = await generateUniqueSlug(name);

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      slug,
    })
    .returning({ id: users.id });

  return NextResponse.json({ id: newUser.id }, { status: 201 });
}
