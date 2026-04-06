import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
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
  const { status, rejectionReason } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const [updated] = await db
    .update(events)
    .set({
      status,
      rejectionReason: status === "rejected" ? rejectionReason : null,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
