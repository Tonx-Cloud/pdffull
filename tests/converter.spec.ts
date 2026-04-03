import { test, expect } from "@playwright/test";

test.describe("Converter Page (sem auth → redireciona para /login)", () => {
  test("redireciona para login quando não autenticado", async ({ page }) => {
    await page.goto("/converter");

    // O middleware protege /converter — sem auth vai para /login
    await expect(page).toHaveURL(/\/login/);
  });
});
