import { test, expect } from "@playwright/test";

test.describe("Páginas Legais", () => {
  test("Termos de Uso renderiza conteúdo", async ({ page }) => {
    await page.goto("/termos");

    await expect(page.getByRole("heading", { name: /Termos de Uso/i })).toBeVisible();
    await expect(page.getByText("Aceitação dos Termos")).toBeVisible();
    await expect(page.getByText("Descrição do Serviço")).toBeVisible();
    await expect(page.getByText("Planos e Pagamentos")).toBeVisible();
    await expect(page.getByText("Uso Aceitável")).toBeVisible();
  });

  test("Privacidade renderiza conteúdo", async ({ page }) => {
    await page.goto("/privacidade");

    await expect(page.getByRole("heading", { name: /Política de Privacidade/i })).toBeVisible();
    await expect(page.getByText("Dados Coletados")).toBeVisible();
    await expect(page.getByText("Processamento Local")).toBeVisible();
    await expect(page.getByRole("heading", { name: /LGPD/i })).toBeVisible();
  });

  test("Termos tem link para voltar", async ({ page }) => {
    await page.goto("/termos");

    // Verificar que existe link "Voltar ao início" para a landing
    const backLink = page.getByRole("link", { name: /Voltar ao início/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Dashboard — Redirect sem auth", () => {
  test("histórico redireciona para login sem auth", async ({ page }) => {
    await page.goto("/historico");

    // Deve redirecionar para login (server-side redirect)
    await expect(page).toHaveURL(/\/login/);
  });

  test("conta redireciona para login sem auth", async ({ page }) => {
    await page.goto("/conta");

    // Deve redirecionar para login
    await expect(page).toHaveURL(/\/login/);
  });
});
