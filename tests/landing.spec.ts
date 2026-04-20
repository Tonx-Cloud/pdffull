import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renderiza hero com título e CTA", async ({ page }) => {
    await page.goto("/");

    const heroHeading = page.getByRole("heading", { name: /Foto em PDF/i });
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText("Um clique");

    const ctaButton = page.getByRole("link", { name: /Converter Agora/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test("exibe header com logo e navegação", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("header").getByRole("link", { name: "PDFfULL" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Entrar/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Converter/i }).first()).toBeVisible();
  });

  test("exibe seção de features (3 cards)", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Câmera Direta")).toBeVisible();
    await expect(page.getByText("Conversão Instantânea")).toBeVisible();
    await expect(page.getByText("Múltiplas Páginas")).toBeVisible();
  });

  test("exibe seção de planos (Free e Pro)", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("R$ 0")).toBeVisible();
    await expect(page.getByText("R$ 9,90")).toBeVisible();
    await expect(page.getByText("Popular")).toBeVisible();
    await expect(page.getByText("5 conversões/mês com conta")).toBeVisible();
    await expect(page.getByText("Conversões ilimitadas")).toBeVisible();
  });

  test("footer com links legais", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /Termos de Uso/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Privacidade/i })).toBeVisible();
  });

  test("CTA redireciona para /converter (ou /login se não autenticado)", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Converter Agora/i }).first().click();
    // Middleware redireciona para /login se não autenticado
    await expect(page).toHaveURL(/\/(converter|login)/);
  });

  test("link Entrar redireciona para /login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
