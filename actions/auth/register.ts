"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function registerAction(data: {
  nombre: string;
  email: string;
  password: string;
}): Promise<{ success: true } | { error: string }> {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { nombre, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "EMAIL_USADO" };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: nombre,
      email,
      password: hashed,
      rol: "turista", // nunca se toma del formulario
    },
  });

  return { success: true };
}
