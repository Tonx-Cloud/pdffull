import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("renderiza formulário de login", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Entrar no PDFfULL")).toBeVisible();
    await expect(page.getByText("Acesse seu histórico")).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar com Google/i })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /Enviar link mágico/i })).toBeVisible();
  });

  test("link para register", async ({ page }) => {
    await page.goto("/login");

    const registerLink = page.getByRole("link", { name: /Criar conta/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test("campo email é obrigatório", async ({ page }) => {
    await page.goto("/login");

    const emailInput = page.getByPlaceholder("seu@email.com");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("separador 'ou com email' está visível", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("ou com email")).toBeVisible();
  });
});

test.describe("Register Page", () => {
  test("renderiza formulário de registro", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByText("Criar Conta", { exact: true })).toBeVisible();
    await expect(page.getByText("5 conversões grátis")).toBeVisible();
    await expect(page.getByRole("button", { name: /Registrar com Google/i })).toBeVisible();
    await expect(page.getByPlaceholder("seu@email.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /Criar conta com email/i })).toBeVisible();
  });

  test("link para login", async ({ page }) => {
    await page.goto("/register");

    const loginLink = page.getByRole("link", { name: /Entrar/i });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
