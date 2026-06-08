import { chromium } from "playwright";
import path from "node:path";

const DEMOS = [
  { slug: "bravio",           file: "demo-bravio" },
  { slug: "eco",              file: "demo-eco" },
  { slug: "equilibrio",       file: "demo-equilibrio" },
  { slug: "marta-solana",     file: "demo-marta-solana" },
  { slug: "claudia-entrena",  file: "demo-claudia-entrena" },
];

const OUT_DIR = path.resolve("../personal/assets/captures");

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

  // Mobile captures (para reels y stories que muestran demos en phone mockup)
  await ctx.close();
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  const MOBILE_DEMOS = ["bravio", "eco", "equilibrio", "marta-solana", "claudia-entrena"];
  for (const slug of MOBILE_DEMOS) {
    const mPage = await mobileCtx.newPage();
    await mPage.goto(`https://demos.ebecerra.es/${slug}/`, { waitUntil: "networkidle", timeout: 45000 });
    await mPage.evaluate(() => {
      const region = [...document.querySelectorAll('[role="region"]')].find((el) =>
        /ejemplo|example/i.test(el.textContent || "")
      );
      region?.remove();
    });
    await mPage.waitForTimeout(800);
    const out = path.join(OUT_DIR, `demo-${slug}-mobile.png`);
    await mPage.screenshot({ path: out, fullPage: false });
    console.log(`  saved mobile: ${out}`);
    await mPage.close();
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
