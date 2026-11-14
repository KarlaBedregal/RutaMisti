import { test, expect } from "@playwright/test";

test.describe("Flujo 3: Reseña verificada visible en perfil de negocio", () => {
  test("las reseñas verificadas aparecen en el perfil", async ({ page }) => {
    // El seed carga 2 reseñas verificadas en negocios aprobados.
    // Buscar en Explorar algún negocio con reseñas.
    await page.goto("/es/explorar");
    await page.waitForLoadState("networkidle");

    const cards = page.locator("a[href*='/negocio/']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // Revisar los primeros 5 negocios hasta encontrar uno con reseña verificada
    const count = await cards.count();
    let found = false;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const href = await cards.nth(i).getAttribute("href");
      if (!href) continue;

      await page.goto(href);
      await page.waitForLoadState("networkidle");

      const badge = page.getByText(/reseña verificada|verified review/i);
      if (await badge.isVisible({ timeout: 2000 }).catch(() => false)) {
        found = true;
        break;
      }
    }

    // Al menos uno de los 14 negocios del seed tiene reseñas verificadas
    expect(found).toBe(true);
  });
});
