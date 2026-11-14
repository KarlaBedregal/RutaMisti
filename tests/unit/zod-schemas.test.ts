import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schemas extraídos de las actions del proyecto
const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const reservaSchema = z.object({
  negocioSlug: z.string(),
  nombreContacto: z.string().min(2, "Nombre muy corto"),
  emailContacto: z.string().email("Correo inválido"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  personas: z.coerce.number().int().min(1).max(50).default(1),
});

const resenaSchema = z.object({
  puntaje: z.number().int().min(1).max(5),
  comentario: z.string().optional(),
});

describe("registerSchema", () => {
  it("acepta datos válidos", () => {
    const result = registerSchema.safeParse({
      nombre: "Ana García",
      email: "ana@ejemplo.com",
      password: "secreto123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = registerSchema.safeParse({
      nombre: "Ana",
      email: "no-es-email",
      password: "secreto123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Correo inválido");
  });

  it("rechaza password menor a 6 chars", () => {
    const result = registerSchema.safeParse({
      nombre: "Ana",
      email: "ana@ejemplo.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza nombre menor a 2 chars", () => {
    const result = registerSchema.safeParse({
      nombre: "A",
      email: "ana@ejemplo.com",
      password: "secreto123",
    });
    expect(result.success).toBe(false);
  });
});

describe("reservaSchema", () => {
  it("acepta reserva válida", () => {
    const result = reservaSchema.safeParse({
      negocioSlug: "picanteria-dona-flor",
      nombreContacto: "Juan Pérez",
      emailContacto: "juan@test.com",
      fecha: "2026-12-15",
      hora: "12:00",
      personas: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza fecha con formato incorrecto", () => {
    const result = reservaSchema.safeParse({
      negocioSlug: "negocio",
      nombreContacto: "Juan",
      emailContacto: "juan@test.com",
      fecha: "15/12/2026",
      hora: "12:00",
      personas: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza personas = 0", () => {
    const result = reservaSchema.safeParse({
      negocioSlug: "negocio",
      nombreContacto: "Juan",
      emailContacto: "juan@test.com",
      fecha: "2026-12-15",
      hora: "12:00",
      personas: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("resenaSchema (puntaje)", () => {
  it("acepta puntaje 1", () => expect(resenaSchema.safeParse({ puntaje: 1 }).success).toBe(true));
  it("acepta puntaje 5", () => expect(resenaSchema.safeParse({ puntaje: 5 }).success).toBe(true));
  it("rechaza puntaje 0", () => expect(resenaSchema.safeParse({ puntaje: 0 }).success).toBe(false));
  it("rechaza puntaje 6", () => expect(resenaSchema.safeParse({ puntaje: 6 }).success).toBe(false));
  it("rechaza puntaje decimal", () => expect(resenaSchema.safeParse({ puntaje: 3.5 }).success).toBe(false));
});
