import { test, expect } from "@playwright/test";

test.describe("Flujo 1: Turista explora → reserva", () => {
  test("turista puede explorar, ver perfil y hacer reserva", async ({ page }) => {
    // 1. Explorar negocios
    await page.goto("/es/explorar");
    await page.waitForLoadState("networkidle");

    // Verificar que hay tarjetas de negocios
    const cards = page.locator("a[href*='/negocio/']");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    // 2. Click en la primera tarjeta
    const firstCardHref = await cards.first().getAttribute("href");
    await cards.first().click();

    // 3. Verificar que llegó al perfil
    await expect(page).toHaveURL(/\/negocio\//);
    await page.waitForLoadState("networkidle");

    // 4. Click en botón Reservar
    const reservarBtn = page.getByRole("link", { name: /reservar/i }).first();
    await expect(reservarBtn).toBeVisible({ timeout: 5000 });
    await reservarBtn.click();

    // 5. Llenar formulario de reserva
    await expect(page).toHaveURL(/\/reservar\//);
    await page.waitForLoadState("networkidle");

    await page.getByLabel(/nombre/i).fill("María Visitante");
    await page.getByLabel(/correo/i).fill("maria@test.com");

    // WhatsApp (opcional según el form)
    const whatsappField = page.getByLabel(/whatsapp/i);
    if (await whatsappField.isVisible()) {
      await whatsappField.fill("+51987654321");
    }

    // Fecha: mañana
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const fechaStr = tomorrow.toISOString().split("T")[0];
    await page.getByLabel(/fecha/i).fill(fechaStr);

    // Hora
    const horaField = page.getByLabel(/hora/i);
    if (await horaField.isVisible()) {
      await horaField.fill("12:00");
    }

    // Personas
    const personasField = page.getByLabel(/personas/i);
    if (await personasField.isVisible()) {
      await personasField.fill("2");
    }

    // Aceptar privacidad si existe
    const privacidadCheck = page.getByRole("checkbox");
    if (await privacidadCheck.isVisible()) {
      await privacidadCheck.check();
    }

    // 6. Enviar
    await page.getByRole("button", { name: /confirmar|reservar|enviar/i }).click();

    // 7. Verificar código AQP-XXXX en la página de confirmación
    await expect(page).toHaveURL(/\/reserva\//, { timeout: 10000 });
    await expect(page.getByText(/AQP-/)).toBeVisible({ timeout: 5000 });
  });
});
