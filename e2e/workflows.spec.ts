import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, email = "estudiante@demo.local") {
  await page.goto("/");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill("Demo360!2026");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Hola,/ })).toBeVisible();
}
test("rechaza credenciales inválidas", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Contraseña", { exact: true }).fill("incorrecta");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Correo o contraseña incorrectos" }),
  ).toContainText("incorrectos");
});
test("reserva, recarga y cancela de extremo a extremo", async ({ page }) => {
  await login(page);
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Salud y psicología", exact: true })
    .click();
  await page.getByRole("button", { name: "Reservar mi lugar" }).first().click();
  await page
    .getByRole("button", { name: "Confirmar reserva", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("confirmada");
  await page.reload();
  await expect(page.getByRole("heading", { name: /Hola,/ })).toBeVisible();
  await page.getByRole("button", { name: /^Mis reservas/ }).click();
  await expect(page.getByRole("table")).toContainText("Medicina general");
  await page
    .getByRole("button", { name: "Ver código", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("img", { name: "Código QR privado de esta reserva" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cerrar diálogo" }).click();
  await page
    .getByRole("button", { name: "Cancelar", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Confirmar cancelación" }).click();
  await expect(page.getByRole("table")).toContainText("Cancelada");
});
test("técnico no ve reservas de terceros ni gestiona calidad", async ({
  page,
}) => {
  await login(page, "tecnico@demo.local");
  await page.getByRole("button", { name: /^Mis reservas/ }).click();
  await expect(
    page.getByRole("heading", { name: "Todo listo para tu primera reserva" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Gestión de calidad", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Espacio de calidad restringido" }),
  ).toBeVisible();
});
test("calidad crea una acción y registra evidencia", async ({ page }) => {
  await login(page, "gestion@demo.local");
  await page
    .getByRole("button", { name: "Gestión de calidad", exact: true })
    .click();
  await page.getByRole("button", { name: "Nueva acción" }).click();
  await page
    .getByLabel("Título", { exact: true })
    .fill("Acción E2E de confirmaciones");
  await page
    .getByLabel("Problema y acción propuesta")
    .fill("Revisar el proceso de confirmación con evidencia ficticia");
  await page.getByLabel("Responsable", { exact: true }).fill("Responsable E2E");
  await page.getByLabel("Fecha límite").fill("2099-01-01");
  await page.getByRole("button", { name: "Guardar acción" }).click();
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Acción E2E de confirmaciones" }),
  });
  await card
    .getByLabel("Evidencia de ejecución")
    .fill("Ejecución documentada de prueba");
  await card.getByRole("button", { name: "Enviar a verificación" }).click();
  await card
    .getByLabel("Evidencia de eficacia")
    .fill("Medición ficticia de eficacia documentada");
  await card
    .getByRole("button", { name: "Verificar eficacia y cerrar" })
    .click();
  await expect(page.getByRole("status")).toContainText("cerrada");
});

test("API protege sesiones, origen y último cupo con peticiones simultáneas", async ({
  playwright,
}) => {
  const baseURL = "http://127.0.0.1:3100";
  const first = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL },
  });
  const second = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL },
  });
  expect((await first.get("/api/state")).status()).toBe(401);
  for (const [context, email] of [
    [first, "estudiante@demo.local"],
    [second, "estudiante2@demo.local"],
  ] as const) {
    expect(
      (
        await context.post("/api/auth", {
          data: { email, password: "Demo360!2026" },
        })
      ).ok(),
    ).toBe(true);
  }
  const responses = await Promise.all(
    [first, second].map((context) =>
      context.post("/api/operations", {
        data: {
          action: "reserve",
          resourceId: "med-2",
          requestId: crypto.randomUUID(),
        },
      }),
    ),
  );
  expect(responses.map((r) => r.status()).sort()).toEqual([200, 400]);
  const state = await (await first.get("/api/state")).json();
  expect(
    state.resources.find((r: { id: string }) => r.id === "med-2").booked,
  ).toBe(1);
  const badOrigin = await first.post("/api/operations", {
    headers: { Origin: "https://foreign.invalid" },
    data: {
      action: "reserve",
      resourceId: "gym-1",
      requestId: crypto.randomUUID(),
    },
  });
  expect(badOrigin.status()).toBe(400);
  await first.dispose();
  await second.dispose();
});

test("navegación móvil y tema oscuro", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  await expect(page.locator("body")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Cambiar tema" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await page
    .getByRole("navigation", { name: "Menú lateral" })
    .getByRole("button", { name: "Servicios", exact: true })
    .click();
  await page.getByRole("button", { name: "Gimnasio", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gimnasio", exact: true }),
  ).toBeVisible();
});

test("catálogo simple con búsqueda y menú estudiantil de tres opciones", async ({
  page,
}) => {
  await login(page);
  const nav = page.getByRole("navigation", { name: "Menú lateral" });
  await expect(nav.getByRole("button")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Reservar un servicio", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Buscar un servicio" })
    .fill("almuerzo");
  await expect(
    page.getByRole("button", { name: "Comedor universitario", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Gimnasio", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Comedor universitario", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Almuerzo universitario" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Volver a servicios" }).click();
  await expect(
    page.getByRole("textbox", { name: "Buscar un servicio" }),
  ).toHaveValue("");
});
