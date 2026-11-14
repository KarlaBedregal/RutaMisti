"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  descripcionEs: z.string().max(1000).optional(),
  descripcionEn: z.string().max(1000).optional(),
  direccion: z.string().max(200).optional(),
  distrito: z.string().max(100).optional(),
  whatsapp: z.string().max(20).optional(),
  telefono: z.string().max(20).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(200).optional(),
  rangoPrecio: z.coerce.number().int().min(1).max(3).optional(),
  aceptaYape: z.coerce.boolean().optional(),
  aceptaTarjeta: z.coerce.boolean().optional(),
  aceptaReservas: z.coerce.boolean().optional(),
  ruc: z.string().max(11).optional(),
});

export async function actualizarPerfilNegocio(
  negocioId: string,
  data: unknown
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autenticado" };

  const negocio = await prisma.negocio.findFirst({
    where: { id: negocioId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!negocio) return { error: "No tienes permiso para editar este negocio" };

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.negocio.update({
    where: { id: negocioId },
    data: {
      ...parsed.data,
      updatedAt: new Date(),
    },
  });

  return { success: true };
}
