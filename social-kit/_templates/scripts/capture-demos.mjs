import { chromium } from "playwright";
import path from "node:path";

const DEMOS = [
  { slug: "eco",              file: "demo-eco" },
  { slug: "equilibrio",       file: "demo-equilibrio" },
  { slug: "marta-solana",     file: "demo-marta-solana" },
  { slug: "claudia-entrena",  file: "demo-claudia-entrena" },
];

const OUT_DIR = path.resolve("../../personal/captures");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const d of DEMOS) {
    const url = `https://demos.ebecerra.es/${d.slug}/`;
    console.log(`→ ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.evaluate(() => {
      // Remove DemoBanner (top "Esta web es un ejemplo" strip)
      const region = [...document.querySelectorAll('[role="region"]')].find((el) =>
        /ejemplo|example/i.test(el.textContent || "")
      );
      region?.remove();
    });
    await page.waitForTimeout(800);
    const out = path.join(OUT_DIR, `${d.file}-desktop.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1440, height: 900 } });
    console.log(`  saved: ${out}`);
  }

  // Mobile capture for eco specifically (story 2 prominent use)
  await ctx.close();
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const mPage = await mobileCtx.newPage();
  await mPage.goto("https://demos.ebecerra.es/eco/", { waitUntil: "networkidle", timeout: 45000 });
  await mPage.evaluate(() => {
    const region = [...document.querySelectorAll('[role="region"]')].find((el) =>
      /ejemplo|example/i.test(el.textContent || "")
    );
    region?.remove();
  });
  await mPage.waitForTimeout(800);
  await mPage.screenshot({ path: path.join(OUT_DIR, "demo-eco-mobile.png"), fullPage: false });
  console.log("  saved mobile eco");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
