"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  resenaId: z.string(),
  respuesta: z.string().min(1).max(500),
});

export async function responderResena(
  data: unknown
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  const { resenaId, respuesta } = parsed.data;

  const resena = await prisma.resena.findFirst({
    where: {
      id: resenaId,
      negocio: { ownerId: session.user.id },
    },
    select: { id: true },
  });
  if (!resena) return { error: "No tienes permiso para responder esta reseña" };

  await prisma.resena.update({
    where: { id: resenaId },
    data: { respuestaNegocio: respuesta },
  });

  return { success: true };
}
