import { describe, it, expect } from "vitest";

// Replica exacta de la función del seed
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

describe("slugify", () => {
  it("convierte acentos y mayúsculas", () => {
    expect(slugify("Picantería Doña Rosa")).toBe("picanteria-dona-rosa");
  });

  it("elimina caracteres especiales", () => {
    const result = slugify("Café & Té");
    expect(result).toMatch(/^cafe.*te$/);
    expect(result).not.toMatch(/[&áéíóúñ]/);
  });

  it("colapsa espacios múltiples en guiones", () => {
    expect(slugify("   espacios   ")).toBe("-espacios-");
  });

  it("maneja texto simple sin transformación", () => {
    expect(slugify("arequipa")).toBe("arequipa");
  });

  it("produce un slug usable en URL", () => {
    const result = slugify("Guías del Misti Tours");
    expect(result).toMatch(/^[a-z0-9-]+$/);
  });
});
