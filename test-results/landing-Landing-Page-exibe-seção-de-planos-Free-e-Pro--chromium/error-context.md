# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.ts >> Landing Page >> exibe seção de planos (Free e Pro)
- Location: tests\landing.spec.ts:31:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('5 conversões por mês')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('5 conversões por mês')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e7]:
      - img [ref=e8]
    - generic [ref=e11]:
      - button "Open issues overlay" [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: "1"
          - generic [ref=e15]: "2"
        - generic [ref=e16]:
          - text: Issue
          - generic [ref=e17]: s
      - button "Collapse issues badge" [ref=e18]:
        - img [ref=e19]
  - generic [ref=e21]:
    - banner [ref=e22]:
      - generic [ref=e23]:
        - heading "PDFfULL" [level=1] [ref=e24]
        - navigation [ref=e25]:
          - generic [ref=e26]:
            - img
            - combobox "Language" [ref=e27] [cursor=pointer]:
              - option "🇧🇷 Português"
              - option "🇺🇸 English" [selected]
              - option "🇪🇸 Español"
              - option "🇨🇳 中文"
              - option "🇮🇳 हिन्दी"
              - option "🇸🇦 العربية"
            - img
          - link "Entrar" [ref=e28] [cursor=pointer]:
            - /url: /login
            - button "Entrar" [ref=e29]
          - link "Converter" [ref=e30] [cursor=pointer]:
            - /url: /converter
            - button "Converter" [ref=e31]
    - main [ref=e32]:
      - generic [ref=e33]:
        - img [ref=e35]
        - heading "Foto em PDF. Um clique." [level=2] [ref=e38]:
          - text: Foto em PDF.
          - text: Um clique.
        - paragraph [ref=e39]: Tire uma foto ou carregue da galeria e converta instantaneamente em PDF otimizado. Sem instalar nada.
        - link "Converter Agora — Grátis" [ref=e40] [cursor=pointer]:
          - /url: /converter
          - button "Converter Agora — Grátis" [ref=e41]:
            - img
            - text: Converter Agora — Grátis
        - paragraph [ref=e42]: 2 conversões grátis sem cadastro • 5 com conta gratuita
        - button "Compartilhar" [ref=e44]:
          - img
          - text: Compartilhar
      - generic [ref=e46]:
        - generic [ref=e47]:
          - img [ref=e49]
          - heading "Câmera Direta" [level=3] [ref=e52]
          - paragraph [ref=e53]: Abra a câmera do celular e capture documentos, notas ou recibos direto pelo navegador.
        - generic [ref=e54]:
          - img [ref=e56]
          - heading "Conversão Instantânea" [level=3] [ref=e58]
          - paragraph [ref=e59]: PDF gerado no seu celular, sem enviar para servidores. Rápido, privado e offline.
        - generic [ref=e60]:
          - img [ref=e62]
          - heading "Múltiplas Páginas" [level=3] [ref=e64]
          - paragraph [ref=e65]: Junte várias fotos em um único PDF multi-página. Reordene e remova antes de gerar.
      - generic [ref=e67]:
        - heading "Planos" [level=2] [ref=e68]
        - generic [ref=e69]:
          - generic [ref=e70]:
            - heading "Free" [level=3] [ref=e71]
            - paragraph [ref=e72]: R$ 0/mês
            - list [ref=e73]:
              - listitem [ref=e74]: ✓ 2 conversões sem cadastro
              - listitem [ref=e75]: ✓ 5 conversões/mês com conta
              - listitem [ref=e76]: ✓ Download direto
              - listitem [ref=e77]: ✓ Funciona offline
          - generic [ref=e78]:
            - generic [ref=e79]: Popular
            - heading "Pro" [level=3] [ref=e80]
            - paragraph [ref=e81]: R$ 9,90/mês
            - list [ref=e82]:
              - listitem [ref=e83]: ✓ Conversões ilimitadas
              - listitem [ref=e84]: ✓ Múltiplas fotos → 1 PDF
              - listitem [ref=e85]: ✓ Histórico na nuvem
              - listitem [ref=e86]: ✓ Links de compartilhamento
              - listitem [ref=e87]: ✓ Suporte prioritário
    - contentinfo [ref=e88]:
      - generic [ref=e89]:
        - link "Sobre Nós" [ref=e90] [cursor=pointer]:
          - /url: /sobre
        - link "FAQ" [ref=e91] [cursor=pointer]:
          - /url: /faq
        - link "Termos de Uso" [ref=e92] [cursor=pointer]:
          - /url: /termos
        - link "Privacidade" [ref=e93] [cursor=pointer]:
          - /url: /privacidade
      - paragraph [ref=e94]: © 2026 PDFfULL. Todos os direitos reservados.
  - region "Notifications alt+T"
  - alert [ref=e95]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Landing Page", () => {
  4  |   test("renderiza hero com título e CTA", async ({ page }) => {
  5  |     await page.goto("/");
  6  | 
  7  |     const heroHeading = page.getByRole("heading", { name: /Foto em PDF/i });
  8  |     await expect(heroHeading).toBeVisible();
  9  |     await expect(heroHeading).toContainText("Um clique");
  10 | 
  11 |     const ctaButton = page.getByRole("link", { name: /Converter Agora/i });
  12 |     await expect(ctaButton).toBeVisible();
  13 |   });
  14 | 
  15 |   test("exibe header com logo e navegação", async ({ page }) => {
  16 |     await page.goto("/");
  17 | 
  18 |     await expect(page.locator("header h1")).toHaveText("PDFfULL");
  19 |     await expect(page.getByRole("link", { name: /Entrar/i })).toBeVisible();
  20 |     await expect(page.getByRole("link", { name: /Converter/i }).first()).toBeVisible();
  21 |   });
  22 | 
  23 |   test("exibe seção de features (3 cards)", async ({ page }) => {
  24 |     await page.goto("/");
  25 | 
  26 |     await expect(page.getByText("Câmera Direta")).toBeVisible();
  27 |     await expect(page.getByText("Conversão Instantânea")).toBeVisible();
  28 |     await expect(page.getByText("Múltiplas Páginas")).toBeVisible();
  29 |   });
  30 | 
  31 |   test("exibe seção de planos (Free e Pro)", async ({ page }) => {
  32 |     await page.goto("/");
  33 | 
  34 |     await expect(page.getByText("R$ 0")).toBeVisible();
  35 |     await expect(page.getByText("R$ 9,90")).toBeVisible();
  36 |     await expect(page.getByText("Popular")).toBeVisible();
> 37 |     await expect(page.getByText("5 conversões/mês com conta")).toBeVisible();
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  38 |     await expect(page.getByText("Conversões ilimitadas")).toBeVisible();
  39 |   });
  40 | 
  41 |   test("footer com links legais", async ({ page }) => {
  42 |     await page.goto("/");
  43 | 
  44 |     const footer = page.locator("footer");
  45 |     await expect(footer.getByRole("link", { name: /Termos de Uso/i })).toBeVisible();
  46 |     await expect(footer.getByRole("link", { name: /Privacidade/i })).toBeVisible();
  47 |   });
  48 | 
  49 |   test("CTA redireciona para /converter (ou /login se não autenticado)", async ({ page }) => {
  50 |     await page.goto("/");
  51 | 
  52 |     await page.getByRole("link", { name: /Converter Agora/i }).click();
  53 |     // Middleware redireciona para /login se não autenticado
  54 |     await expect(page).toHaveURL(/\/(converter|login)/);
  55 |   });
  56 | 
  57 |   test("link Entrar redireciona para /login", async ({ page }) => {
  58 |     await page.goto("/");
  59 | 
  60 |     await page.getByRole("link", { name: /Entrar/i }).click();
  61 |     await expect(page).toHaveURL(/\/login/);
  62 |   });
  63 | });
  64 | 
```