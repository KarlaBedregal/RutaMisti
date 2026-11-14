"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  tipo: z.enum(["reclamo", "queja"]),
  nombre: z.string().min(2).max(100),
  documento: z.string().max(20).optional(),
  email: z.string().email(),
  telefono: z.string().max(20).optional(),
  domicilio: z.string().max(200).optional(),
  detalle: z.string().min(10).max(2000),
  pedido: z.string().max(500).optional(),
});

function generarCodigoReclamo(): string {
  const year = new Date().getFullYear();
  const num = Math.floor(10000 + Math.random() * 90000);
  return `REC-${year}-${num}`;
}

export async function crearReclamo(
  data: unknown
): Promise<{ success: true; codigo: string } | { error: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  let codigo = "";
  for (let i = 0; i < 5; i++) {
    const candidato = generarCodigoReclamo();
    const exists = await prisma.reclamo.findUnique({ where: { codigo: candidato } });
    if (!exists) {
      codigo = candidato;
      break;
    }
  }
  if (!codigo) return { error: "No se pudo generar el código. Intenta de nuevo." };

  await prisma.reclamo.create({
    data: {
      codigo,
      tipo: parsed.data.tipo,
      nombre: parsed.data.nombre,
      documento: parsed.data.documento || null,
      email: parsed.data.email,
      telefono: parsed.data.telefono || null,
      domicilio: parsed.data.domicilio || null,
      detalle: parsed.data.detalle,
      pedido: parsed.data.pedido || null,
      estado: "pendiente",
    },
  });

  return { success: true, codigo };
}
