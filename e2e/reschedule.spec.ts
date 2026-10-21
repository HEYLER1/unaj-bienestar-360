import { test, expect } from "@playwright/test";
test("reprograma una atención, conserva la reserva y presenta un QR renovado con el nuevo horario", async ({
  page,
  browser,
}) => {
  const base = "http://127.0.0.1:3100";
  const headers = { Origin: base };
  const management = await browser.newContext({ baseURL: base });
  expect(
    (
      await management.request.post("/api/auth", {
        headers,
        data: { email: "gestion@demo.local", password: "Demo360!2026" },
      })
    ).ok(),
  ).toBeTruthy();
  const date = new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-CA", {
    timeZone: "America/Lima",
  });
  const published = await management.request.post("/api/schedules", {
    headers,
    data: { templateId: "med-1", date, time: "11:00", capacity: 1 },
  });
  expect(published.ok()).toBeTruthy();
  const target = (await published.json()).id;
  await page.goto("/");
  await page
    .getByRole("button", { name: "Iniciar sesión", exact: true })
    .click();
  await page.getByRole("button", { name: "Cerrar sesión" }).waitFor();
  const booked = await page.request.post("/api/operations", {
    headers,
    data: {
      action: "reserve",
      resourceId: "med-1",
      requestId: crypto.randomUUID(),
    },
  });
  expect(booked.ok()).toBeTruthy();
  const original = (await booked.json()).result;
  await page.reload();
  await page
    .getByRole("button", { name: /^Mis reservas/ })
    .first()
    .click();
  const row = page
    .getByRole("row")
    .filter({
      has: page.getByRole("button", {
        name: "Cambiar fecha y hora",
        exact: true,
      }),
    })
    .filter({ hasText: "Medicina general" });
  await row
    .getByRole("button", { name: "Cambiar fecha y hora", exact: true })
    .click();
  await page.locator("#reschedule-date").fill(date);
  await page.locator("#reschedule-time").selectOption(target);
  await page
    .getByRole("button", { name: "Confirmar nuevo horario", exact: true })
    .click();
  const pass = page.getByRole("dialog", {
    name: "Turno de atención confirmado",
  });
  await expect(pass).toBeVisible();
  await expect(pass).toContainText("11:00");
  await expect(
    pass.getByAltText("Código QR privado de esta reserva"),
  ).toBeVisible();
  const state = await (await page.request.get("/api/state")).json();
  const changed = state.bookings.find(
    (b: { id: string }) => b.id === original.id,
  );
  expect(changed.resource_id).toBe(target);
  expect(changed.token).not.toBe(original.token);
  const old = await management.request.post("/api/operations", {
    headers,
    data: { action: "checkin", bookingId: original.id, token: original.token },
  });
  expect(old.status()).toBe(400);
  expect((await old.json()).error).toContain("inválido");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(pass).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/turno-reprogramado.png" });
  await management.close();
});
