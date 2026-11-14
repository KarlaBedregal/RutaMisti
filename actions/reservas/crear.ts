"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "crypto";

const schema = z.object({
  negocioSlug: z.string(),
  nombreContacto: z.string().min(2, "Nombre muy corto"),
  emailContacto: z.string().email("Correo inválido"),
  whatsappContacto: z.string().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  personas: z.coerce.number().int().min(1).max(50).default(1),
  servicioId: z.string().optional(),
  comentario: z.string().max(500).optional(),
});

type CrearReservaInput = z.infer<typeof schema>;

function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "AQP-";
  const bytes = randomBytes(4);
  for (const b of bytes) {
    code += chars[b % chars.length];
  }
  return code;
}

export async function crearReserva(
  data: CrearReservaInput
): Promise<{ codigo: string } | { error: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { negocioSlug, ...campos } = parsed.data;

  const negocio = await prisma.negocio.findUnique({
    where: { slug: negocioSlug, estado: "aprobado" },
    select: { id: true },
  });

  if (!negocio) return { error: "Negocio no encontrado" };

  // Generar código único (reintentar si colisiona)
  let codigo = "";
  for (let i = 0; i < 5; i++) {
    const candidato = generarCodigo();
    const exists = await prisma.reserva.findUnique({ where: { codigo: candidato } });
    if (!exists) {
      codigo = candidato;
      break;
    }
  }
  if (!codigo) return { error: "No se pudo generar el código. Intenta de nuevo." };

  await prisma.reserva.create({
    data: {
      codigo,
      negocioId: negocio.id,
      nombreContacto: campos.nombreContacto,
      emailContacto: campos.emailContacto,
      whatsappContacto: campos.whatsappContacto || null,
      fecha: campos.fecha,
      hora: campos.hora,
      personas: campos.personas,
      servicioId: campos.servicioId || null,
      comentario: campos.comentario || null,
      estado: "pendiente",
      canalOrigen: "web",
    },
  });

  return { codigo };
}
