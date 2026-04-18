import { test, expect } from "@playwright/test";

test.describe("Converter Page (sem auth)", () => {
  test("carrega normalmente sem autenticação", async ({ page }) => {
    await page.goto("/converter");

    // /converter é acessível sem auth (apenas /historico e /conta são protegidas)
    await expect(page).toHaveURL(/\/converter/);
  });
});
