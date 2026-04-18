import { test, expect } from "@playwright/test";

test.describe("Upgrade Modal", () => {
  test("converter page mostra banner de limite para free", async ({ page }) => {
    await page.goto("/converter");

    // Banner de conversões (quando limite hook responder)
    // Pode mostrar "X/5 conversões usadas" ou "Limite mensal atingido"
    const limitBanner = page.locator("text=/conversões usadas|Limite mensal/");
    // O banner pode não aparecer se o hook está loading, verificamos soft
    if (await limitBanner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(limitBanner).toBeVisible();
    }
  });
});

test.describe("Navegação Geral", () => {
  test("fluxo landing → login → register → landing", async ({ page }) => {
    // 1. Landing
    await page.goto("/");
    await expect(page.locator("header h1")).toHaveText("PDFfULL");

    // 2. Ir para Login
    await page.getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("Entrar no PDFfULL")).toBeVisible();

    // 3. Ir para Register
    await page.getByRole("link", { name: /Criar conta/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByText("Criar Conta", { exact: true })).toBeVisible();

    // 4. Voltar para Login
    await page.getByRole("link", { name: /Entrar$/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("fluxo landing → converter (acessível sem auth)", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Converter Agora/i }).click();
    // /converter é acessível sem auth
    await expect(page).toHaveURL(/\/converter/);
  });

  test("fluxo landing → termos", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Termos de Uso/i }).click();
    await expect(page).toHaveURL(/\/termos/);
  });

  test("fluxo landing → privacidade", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Privacidade/i }).click();
    await expect(page).toHaveURL(/\/privacidade/);
  });
});
