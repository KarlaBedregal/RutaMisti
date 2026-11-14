import { describe, it, expect } from "vitest";
import { randomBytes } from "crypto";

// Replica exacta de generarCodigo() de actions/reservas/crear.ts
function generarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "AQP-";
  const bytes = randomBytes(4);
  for (const b of bytes) {
    code += chars[b % chars.length];
  }
  return code;
}

describe("generarCodigo", () => {
  it("empieza con AQP-", () => {
    expect(generarCodigo()).toMatch(/^AQP-/);
  });

  it("tiene exactamente 8 caracteres (AQP- + 4)", () => {
    expect(generarCodigo()).toHaveLength(8);
  });

  it("solo usa caracteres del alfabeto permitido", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codigo = generarCodigo();
    const sufijo = codigo.slice(4);
    for (const c of sufijo) {
      expect(chars).toContain(c);
    }
  });

  it("genera valores distintos entre llamadas (probabilístico)", () => {
    const codigos = new Set(Array.from({ length: 20 }, generarCodigo));
    // Con 32^4 combinaciones posibles, 20 llamadas no deberían colisionar
    expect(codigos.size).toBeGreaterThan(15);
  });
});
