import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(__dirname, "..", "docs", "screenshots");
const BASE_URL = "https://www.pdf-full.com";

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  // ─── Mobile screenshots (Pixel 5) ───
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 851 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  });
  const page = await mobileContext.newPage();

  // 1. Landing page (full)
  console.log("📸 01 - Landing page...");
  await page.goto(BASE_URL, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "01-landing.png"),
    fullPage: true,
  });

  // 2. Hero only (viewport)
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "02-hero.png"),
  });

  // 3. Register
  console.log("📸 03 - Register...");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "03-register.png"),
  });

  // 4. Login
  console.log("📸 04 - Login...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "04-login.png"),
  });

  // 5. Sobre
  console.log("📸 05 - Sobre...");
  await page.goto(`${BASE_URL}/sobre`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "05-sobre.png"),
    fullPage: true,
  });

  // 6. Termos
  console.log("📸 06 - Termos...");
  await page.goto(`${BASE_URL}/termos`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "06-termos.png"),
    fullPage: true,
  });

  // 7. Privacidade
  console.log("📸 07 - Privacidade...");
  await page.goto(`${BASE_URL}/privacidade`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "07-privacidade.png"),
    fullPage: true,
  });

  // 8. FAQ
  console.log("📸 08 - FAQ...");
  await page.goto(`${BASE_URL}/faq`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "08-faq.png"),
    fullPage: true,
  });

  // ─── Desktop screenshots ───
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();

  // 9. Landing desktop
  console.log("📸 09 - Landing desktop...");
  await desktopPage.goto(BASE_URL, { waitUntil: "load", timeout: 60000 });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: path.join(OUTPUT_DIR, "09-landing-desktop.png"),
    fullPage: true,
  });

  // 10. FAQ desktop
  console.log("📸 10 - FAQ desktop...");
  await desktopPage.goto(`${BASE_URL}/faq`, { waitUntil: "load", timeout: 60000 });
  await desktopPage.waitForTimeout(500);
  await desktopPage.screenshot({
    path: path.join(OUTPUT_DIR, "10-faq-desktop.png"),
    fullPage: true,
  });

  await browser.close();

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png"));
  console.log(`\n✅ ${files.length} screenshots salvas em: ${OUTPUT_DIR}`);
  files.forEach((f) => console.log(`   - ${f}`));
}

main().catch(console.error);
