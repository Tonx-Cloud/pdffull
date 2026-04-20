import { test, expect } from "@playwright/test";

/**
 * Suite E2E completa contra produção (www.pdf-full.com)
 * Testa todos os links, botões e fluxos como um usuário real.
 * Executar: npx playwright test tests/production-e2e.spec.ts
 */

const BASE = "https://www.pdf-full.com";

// ═══════════════════════════════════════════════════════════════
// 1. LANDING PAGE — Hero, Header, Features, Planos, Footer
// ═══════════════════════════════════════════════════════════════

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
  });

  test("hero renderiza título, subtítulo e CTA", async ({ page }) => {
    await expect(page.locator("header").getByRole("link", { name: "PDFfULL" })).toBeVisible();
    const hero = page.getByRole("heading", { name: /Foto em PDF/i });
    await expect(hero).toBeVisible();
    const cta = page.getByRole("link", { name: /Converter Agora/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/converter");
    await expect(page.getByText(/2 conversões grátis sem cadastro/i)).toBeVisible();
  });

  test("header: links Entrar e Converter", async ({ page }) => {
    const entrar = page.locator("header").getByRole("link", { name: /Entrar/i });
    await expect(entrar).toBeVisible();
    await expect(entrar).toHaveAttribute("href", "/login");

    const converter = page.locator("header").getByRole("link", { name: /Converter/i }).first();
    await expect(converter).toBeVisible();
    await expect(converter).toHaveAttribute("href", "/converter");
  });

  test("seção features: 3 cards", async ({ page }) => {
    await expect(page.getByText("Câmera Direta")).toBeVisible();
    await expect(page.getByText("Conversão Instantânea")).toBeVisible();
    await expect(page.getByText("Múltiplas Páginas")).toBeVisible();
  });

  test("seção planos: Free e Pro com preços", async ({ page }) => {
    await expect(page.getByText("R$ 0")).toBeVisible();
    await expect(page.getByText("R$ 9,90")).toBeVisible();
    await expect(page.getByText("Popular")).toBeVisible();
    await expect(page.getByText(/5 conversões\/mês/)).toBeVisible();
    await expect(page.getByText("Conversões ilimitadas")).toBeVisible();
  });

  test("footer: links legais (Sobre, FAQ, Termos, Privacidade)", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /Sobre/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Perguntas Frequentes/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Termos/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /Privacidade/i })).toBeVisible();
  });

  test("LanguageSelector está presente", async ({ page }) => {
    // O seletor de idioma está no DOM (visível apenas no desktop via CSS)
    await expect(page.locator("select").first()).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. NAVEGAÇÃO — Todos os links da landing levam ao destino
// ═══════════════════════════════════════════════════════════════

test.describe("Navegação a partir da Landing", () => {
  test("CTA Converter Agora → /converter", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Converter Agora/i }).first().click();
    await expect(page).toHaveURL(/\/converter/);
  });

  test("header Entrar → /login", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.locator("header").getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("footer Sobre → /sobre", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.locator("footer").getByRole("link", { name: /Sobre/i }).click();
    await expect(page).toHaveURL(/\/sobre/);
    await expect(page.getByRole("heading", { name: /PDFfULL/i }).first()).toBeVisible();
  });

  test("footer FAQ → /faq", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.locator("footer").getByRole("link", { name: /Perguntas Frequentes/i }).click();
    await expect(page).toHaveURL(/\/faq/);
    await expect(page.getByText("Perguntas Frequentes")).toBeVisible();
  });

  test("footer Termos → /termos", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.locator("footer").getByRole("link", { name: /Termos/i }).click();
    await expect(page).toHaveURL(/\/termos/);
  });

  test("footer Privacidade → /privacidade", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await page.locator("footer").getByRole("link", { name: /Privacidade/i }).click();
    await expect(page).toHaveURL(/\/privacidade/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. LOGIN PAGE — Formulário, botões, links
// ═══════════════════════════════════════════════════════════════

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  });

  test("renderiza título e subtítulo", async ({ page }) => {
    await expect(page.getByText("Entrar no PDFfULL")).toBeVisible();
    await expect(page.getByText(/Acesse seu histórico/i)).toBeVisible();
  });

  test("botão Google OAuth visível", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Entrar com Google/i })).toBeVisible();
  });

  test("formulário email + magic link", async ({ page }) => {
    const emailInput = page.getByPlaceholder("seu@email.com");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: /Enviar link mágico/i })).toBeVisible();
  });

  test("divisor 'ou com email'", async ({ page }) => {
    await expect(page.getByText("ou com email")).toBeVisible();
  });

  test("link Criar conta → /register", async ({ page }) => {
    await page.getByRole("link", { name: /Criar conta/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. REGISTER PAGE — Formulário, checkbox termos, links
// ═══════════════════════════════════════════════════════════════

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  });

  test("renderiza título e subtítulo", async ({ page }) => {
    await expect(page.getByText("Criar Conta", { exact: true })).toBeVisible();
    await expect(page.getByText(/5 conversões grátis/i)).toBeVisible();
  });

  test("botões desabilitados sem aceitar termos", async ({ page }) => {
    const googleBtn = page.getByRole("button", { name: /Registrar com Google/i });
    const emailBtn = page.getByRole("button", { name: /Criar conta com email/i });
    await expect(googleBtn).toBeDisabled();
    await expect(emailBtn).toBeDisabled();
  });

  test("botões habilitados após aceitar termos", async ({ page }) => {
    // Aguardar hydration completa (beforeEach usa domcontentloaded)
    await page.waitForLoadState("networkidle");

    // Clicar no label do checkbox para disparar onChange do React
    const label = page.locator('label').filter({ hasText: 'Li e aceito' });
    await label.click();

    // Confirmar que checkbox foi marcado (React processou o evento)
    await expect(page.locator('input[type="checkbox"]')).toBeChecked({ timeout: 5_000 });

    // Aguardar botões habilitados
    const googleBtn = page.getByRole("button", { name: /Registrar com Google/i });
    const emailBtn = page.getByRole("button", { name: /Criar conta com email/i });
    await expect(googleBtn).toBeEnabled({ timeout: 10_000 });
    await expect(emailBtn).toBeEnabled({ timeout: 10_000 });
  });

  test("links Termos e Privacidade na checkbox", async ({ page }) => {
    const termosLink = page.getByRole("link", { name: /Termos de Uso/i });
    await expect(termosLink).toHaveAttribute("href", "/termos");
    const privLink = page.getByRole("link", { name: /Política de Privacidade/i });
    await expect(privLink).toHaveAttribute("href", "/privacidade");
  });

  test("link Entrar → /login", async ({ page }) => {
    await page.getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. CONVERTER PAGE (sem auth) — Acesso anônimo liberado
// ═══════════════════════════════════════════════════════════════

test.describe("Converter Page (anônimo)", () => {
  test("página carrega sem redirect", async ({ page }) => {
    await page.goto(`${BASE}/converter`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/converter/);
    await expect(page.getByRole("heading", { name: /Converter/i })).toBeVisible();
  });

  test("subtítulo e área de captura visíveis", async ({ page }) => {
    await page.goto(`${BASE}/converter`, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Tire uma foto ou carregue/i)).toBeVisible();
  });

  test("dashboard header presente com links", async ({ page }) => {
    await page.goto(`${BASE}/converter`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header").getByText("PDFfULL")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 6. ROTAS PROTEGIDAS (sem auth) → Redirect para /login
// ═══════════════════════════════════════════════════════════════

test.describe("Rotas protegidas (sem auth)", () => {
  test("/historico → redirect /login", async ({ page }) => {
    await page.goto(`${BASE}/historico`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });

  test("/conta → redirect /login", async ({ page }) => {
    await page.goto(`${BASE}/conta`, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/login/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 7. FAQ PAGE — Conteúdo, accordions, links
// ═══════════════════════════════════════════════════════════════

test.describe("FAQ Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/faq`, { waitUntil: "domcontentloaded" });
  });

  test("título e subtítulo", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Perguntas Frequentes/i })).toBeVisible();
    await expect(page.getByText(/Tudo o que você precisa saber/i)).toBeVisible();
  });

  test("5 seções de FAQ", async ({ page }) => {
    await expect(page.getByText("Uso Geral")).toBeVisible();
    await expect(page.getByText("Planos e Limites")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Funcionalidades" })).toBeVisible();
    await expect(page.getByText("Privacidade e Segurança")).toBeVisible();
    await expect(page.getByText("Problemas Comuns")).toBeVisible();
  });

  test("accordion abre e fecha", async ({ page }) => {
    const firstQuestion = page.locator("details summary").first();
    await firstQuestion.click();
    const details = page.locator("details").first();
    await expect(details).toHaveAttribute("open", "");
    await firstQuestion.click();
    // Fechou — sem atributo open
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("link voltar → /", async ({ page }) => {
    const voltarLink = page.getByRole("link", { name: /Voltar/i });
    await expect(voltarLink).toBeVisible();
    await voltarLink.click();
    await expect(page).toHaveURL(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
  });
});

// ═══════════════════════════════════════════════════════════════
// 8. SOBRE PAGE — Conteúdo e links
// ═══════════════════════════════════════════════════════════════

test.describe("Sobre Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/sobre`, { waitUntil: "domcontentloaded" });
  });

  test("título e missão", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /PDFfULL/i }).first()).toBeVisible();
    await expect(page.getByText(/Conversor instantâneo/i)).toBeVisible();
    await expect(page.getByText(/Nossa Missão/i)).toBeVisible();
  });

  test("seções: Como Funciona, Planos, Tecnologia", async ({ page }) => {
    await expect(page.getByText(/Como Funciona/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Tecnologia/i })).toBeVisible();
  });

  test("links footer: Termos, Privacidade, Voltar", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Termos/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Privacidade/i })).toBeVisible();
    const voltar = page.getByRole("link", { name: /Voltar ao início/i });
    await expect(voltar).toBeVisible();
    await voltar.click();
    await expect(page).toHaveURL(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
  });
});

// ═══════════════════════════════════════════════════════════════
// 9. TERMOS PAGE — Conteúdo, links internos
// ═══════════════════════════════════════════════════════════════

test.describe("Termos Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/termos`, { waitUntil: "domcontentloaded" });
  });

  test("título e seções principais", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Termos de Uso/i })).toBeVisible();
    await expect(page.getByText("Aceitação dos Termos")).toBeVisible();
    await expect(page.getByText("Descrição do Serviço")).toBeVisible();
    await expect(page.getByText("Planos e Pagamentos")).toBeVisible();
    await expect(page.getByText("Uso Aceitável")).toBeVisible();
  });

  test("referência ao domínio www.pdf-full.com", async ({ page }) => {
    await expect(page.getByText("www.pdf-full.com")).toBeVisible();
  });

  test("link Privacidade e Voltar", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Privacidade/i }).first()).toBeVisible();
    const voltar = page.getByRole("link", { name: /Voltar ao início/i });
    await expect(voltar).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 10. PRIVACIDADE PAGE — Conteúdo, LGPD
// ═══════════════════════════════════════════════════════════════

test.describe("Privacidade Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/privacidade`, { waitUntil: "domcontentloaded" });
  });

  test("título e seções", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Política de Privacidade/i })).toBeVisible();
    await expect(page.getByText("Dados Coletados")).toBeVisible();
    await expect(page.getByText("Processamento Local")).toBeVisible();
  });

  test("seção LGPD presente", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /LGPD/i })).toBeVisible();
  });

  test("links Termos e Voltar", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Termos/i }).first()).toBeVisible();
    const voltar = page.getByRole("link", { name: /Voltar ao início/i });
    await expect(voltar).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// 11. FLUXOS DE NAVEGAÇÃO MULTI-STEP
// ═══════════════════════════════════════════════════════════════

test.describe("Fluxos de navegação completos", () => {
  test("landing → login → register → login (ciclo auth)", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    // Landing → Login
    await page.locator("header").getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Login → Register
    await page.getByRole("link", { name: /Criar conta/i }).click();
    await expect(page).toHaveURL(/\/register/);

    // Register → Login
    await page.getByRole("link", { name: /Entrar/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("landing → FAQ → voltar → sobre → voltar", async ({ page }) => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });

    // → FAQ
    await page.locator("footer").getByRole("link", { name: /Perguntas Frequentes/i }).click();
    await expect(page).toHaveURL(/\/faq/);

    // FAQ → Landing
    await page.getByRole("link", { name: /Voltar/i }).click();
    await expect(page).toHaveURL(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));

    // → Sobre
    await page.locator("footer").getByRole("link", { name: /Sobre/i }).click();
    await expect(page).toHaveURL(/\/sobre/);

    // Sobre → Landing
    await page.getByRole("link", { name: /Voltar ao início/i }).click();
    await expect(page).toHaveURL(new RegExp(`^${BASE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`));
  });

  test("termos ↔ privacidade (cross-link)", async ({ page }) => {
    await page.goto(`${BASE}/termos`, { waitUntil: "domcontentloaded" });

    // Termos → Privacidade
    await page.getByRole("link", { name: /Privacidade/i }).first().click();
    await expect(page).toHaveURL(/\/privacidade/);

    // Privacidade → Termos
    await page.getByRole("link", { name: /Termos/i }).first().click();
    await expect(page).toHaveURL(/\/termos/);
  });
});

// ═══════════════════════════════════════════════════════════════
// 12. DOMÍNIO — SSL, redirects, headers de segurança
// ═══════════════════════════════════════════════════════════════

test.describe("Domínio e Segurança", () => {
  test("HTTPS funciona em www.pdf-full.com", async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
    expect(response?.url()).toContain("https://");
  });

  test("HTTPS funciona em pdf-full.com (raiz)", async ({ page }) => {
    const response = await page.goto("https://pdf-full.com", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBe(200);
  });

  test("headers de segurança presentes", async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: "domcontentloaded" });
    const headers = response?.headers() || {};

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("manifest.json acessível", async ({ page }) => {
    const response = await page.goto(`${BASE}/manifest.json`);
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json.name).toBe("PDFfULL");
    expect(json.display).toBe("standalone");
  });

  test("robots.txt acessível", async ({ page }) => {
    const response = await page.goto(`${BASE}/robots.txt`);
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("User-Agent:");
    expect(text).toContain("Sitemap:");
  });

  test("sitemap.xml acessível", async ({ page }) => {
    const response = await page.goto(`${BASE}/sitemap.xml`);
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain("<urlset");
    expect(text).toContain("www.pdf-full.com");
  });
});

// ═══════════════════════════════════════════════════════════════
// 13. MOBILE — Hamburger menu, responsividade
// ═══════════════════════════════════════════════════════════════

test.describe("Mobile — Hamburger Menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("hamburger menu abre e mostra links", async ({ page }) => {
    // Setar viewport mobile explicitamente
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/converter`, { waitUntil: "domcontentloaded" });

    // Menu hamburger deve ser visível no mobile
    const menuButton = page.getByLabel("Menu");
    await expect(menuButton).toBeVisible({ timeout: 10_000 });
    await menuButton.click();

    // Aguardar PDFfULL link (sempre visível) + link de navegação no dropdown
    await expect(page.locator("header").getByText("PDFfULL")).toBeVisible();
    // O dropdown mobile é um nav com links dentro do header
    await page.waitForTimeout(500);
    const links = page.locator("header a");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2); // PDFfULL + pelo menos Converter ou Entrar
  });
});
