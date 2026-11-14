"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  negocioId: z.string(),
  estado: z.enum(["aprobado", "rechazado", "suspendido"]),
  motivoRechazo: z.string().max(300).optional(),
});

export async function aprobarNegocio(
  data: unknown
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") {
    return { error: "Solo administradores" };
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  await prisma.negocio.update({
    where: { id: parsed.data.negocioId },
    data: { estado: parsed.data.estado },
  });

  return { success: true };
}

const moderarResenaSchema = z.object({
  resenaId: z.string(),
  estado: z.enum(["visible", "oculta"]),
});

export async function moderarResena(
  data: unknown
): Promise<{ success: true } | { error: string }> {
  const session = await auth();
  if ((session?.user as { rol?: string })?.rol !== "admin") {
    return { error: "Solo administradores" };
  }

  const parsed = moderarResenaSchema.safeParse(data);
  if (!parsed.success) return { error: "Datos inválidos" };

  await prisma.resena.update({
    where: { id: parsed.data.resenaId },
    data: { estado: parsed.data.estado },
  });

  return { success: true };
}
