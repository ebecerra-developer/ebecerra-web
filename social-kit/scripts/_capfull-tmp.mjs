import { chromium } from "playwright";
import path from "node:path";

// Capturas de PÁGINA COMPLETA (móvil, tall) de las demos → para el efecto de scroll
// dentro del reel demos v3. Salida: demo-{slug}-mobile-full.png
const SLUGS = ["bravio", "eco", "equilibrio", "marta-solana", "claudia-entrena", "vega-asociados"];
const OUT_DIR = path.resolve("../personal/assets/captures");

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true, hasTouch: true,
});
for (const slug of SLUGS) {
  const page = await ctx.newPage();
  await page.goto(`https://demos.ebecerra.es/${slug}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => {
    const region = [...document.querySelectorAll('[role="region"]')].find((el) => /ejemplo|example/i.test(el.textContent || ""));
    region?.remove();
  });
  // descartar banner de cookies (aceptar) y limpiar restos
  try {
    const btn = page.getByRole("button", { name: /aceptar/i }).first();
    if (await btn.count()) { await btn.click({ timeout: 2000 }); await page.waitForTimeout(400); }
  } catch {}
  await page.evaluate(() => {
    document.querySelectorAll('[class*="cookie" i],[id*="cookie" i],[class*="consent" i]').forEach((e) => e.remove());
  });
  await page.waitForTimeout(1500);
  const out = path.join(OUT_DIR, `demo-${slug}-mobile-full.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log("ok", slug);
  await page.close();
}
await browser.close();
console.log("done");
