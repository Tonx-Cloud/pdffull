import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(__dirname, "..", "docs", "screenshots");
const BASE_URL = "https://pdffull.vercel.app";

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // Mobile viewport (Pixel 5)
  const context = await browser.newContext({
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });

  const page = await context.newPage();

  // 1. Landing page
  console.log("📸 Landing page...");
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-landing.png"),
    fullPage: true,
  });

  // 2. Landing - hero only (viewport)
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-hero.png"),
  });

  // 3. Register page
  console.log("📸 Register...");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-register.png"),
  });

  // 4. Login page
  console.log("📸 Login...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-login.png"),
  });

  // 5. Sobre
  console.log("📸 Sobre...");
  await page.goto(`${BASE_URL}/sobre`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-sobre.png"),
    fullPage: true,
  });

  // 6. Termos
  console.log("📸 Termos...");
  await page.goto(`${BASE_URL}/termos`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-termos.png"),
    fullPage: true,
  });

  // 7. Privacidade
  console.log("📸 Privacidade...");
  await page.goto(`${BASE_URL}/privacidade`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07-privacidade.png"),
    fullPage: true,
  });

  // 8. FAQ
  console.log("📸 FAQ...");
  await page.goto(`${BASE_URL}/faq`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08-faq.png"),
    fullPage: true,
  });

  // Desktop viewport for some shots
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();

  // 9. Landing desktop
  console.log("📸 Landing desktop...");
  await desktopPage.goto(BASE_URL, { waitUntil: "networkidle" });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: path.join(OUTPUT_DIR, "09-landing-desktop.png"),
    fullPage: true,
  });

  await browser.close();
  console.log(`\n✅ Screenshots salvas em: ${OUTPUT_DIR}`);
  console.log(
    `   Arquivos: ${fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png")).length} imagens`
  );
}

main().catch(console.error);
