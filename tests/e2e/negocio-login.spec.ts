import { test, expect } from "@playwright/test";

test.describe("Flujo 2: Negocio hace login y accede al panel", () => {
  test("dueño de negocio puede ingresar y ver su panel", async ({ page }) => {
    // 1. Ir a login
    await page.goto("/es/ingresar");
    await page.waitForLoadState("networkidle");

    // 2. Llenar credenciales
    await page.getByLabel(/correo/i).fill("negocio1@test.com");
    await page.getByLabel(/contraseña/i).fill("Negocio123!");

    // 3. Submit
    await page.getByRole("button", { name: /ingresar|entrar|sign in/i }).click();

    // 4. Verificar redirect al panel
    await expect(page).toHaveURL(/\/panel\//, { timeout: 10000 });

    // 5. Verificar contenido del panel
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(/dashboard|reservas|panel/i).first()
    ).toBeVisible({ timeout: 5000 });
  });
});
