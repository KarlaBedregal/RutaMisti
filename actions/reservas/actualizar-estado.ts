"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  reservaId: z.string(),
  estado: z.enum(["confirmada", "rechazada", "cancelada", "completada", "no_asistio"]),
});

export async function actualizarEstadoReserva(
  data: unknown
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  const { reservaId, estado } = parsed.data;

  const reserva = await prisma.reserva.findFirst({
    where: {
      id: reservaId,
      negocio: { ownerId: session.user.id },
    },
    select: { id: true },
  });
  if (!reserva) return { error: "No tienes permiso para modificar esta reserva" };

  await prisma.reserva.update({
    where: { id: reservaId },
    data: { estado },
  });

  return { success: true };
}
