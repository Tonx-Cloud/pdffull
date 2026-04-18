import { test, expect } from "@playwright/test";

/**
 * Suite de testes visuais (screenshot comparison) — 8 páginas × 3 viewports
 * Gera snapshots de referência na primeira execução.
 * Nas próximas, compara pixel a pixel com o snapshot salvo.
 *
 * Gerar/atualizar referências: npx playwright test tests/visual-regression.spec.ts --project=chromium --update-snapshots
 * Rodar testes:                npx playwright test tests/visual-regression.spec.ts --project=chromium
 */

const BASE = "https://www.pdf-full.com";

const PAGES = [
  { name: "landing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "converter", path: "/converter" },
  { name: "faq", path: "/faq" },
  { name: "sobre", path: "/sobre" },
  { name: "termos", path: "/termos" },
  { name: "privacidade", path: "/privacidade" },
] as const;

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
] as const;

for (const vp of VIEWPORTS) {
  test.describe(`Visual — ${vp.name} (${vp.width}×${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const pg of PAGES) {
      test(`${pg.name}`, async ({ page }) => {
        await page.goto(`${BASE}${pg.path}`, { waitUntil: "networkidle" });

        // Desabilitar animações CSS para screenshots determinísticos
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
          `,
        });

        // Aguardar reflow após desabilitar animações
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot(`${pg.name}-${vp.name}.png`, {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
        });
      });
    }
  });
}
