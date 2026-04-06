import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { role } = await request.json();

  if (!["user", "trusted", "admin"].includes(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  if (!updated) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
