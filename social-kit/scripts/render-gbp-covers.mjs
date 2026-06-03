import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Renderiza la portada del GBP (estilo tríptico) en varias proporciones,
// porque Google recorta distinto según la superficie. Output 2x (retina).

const HTML = path.resolve("personal/covers/gbp-cover-triptico.html");
const OUT_DIR = path.resolve("personal/covers");

// viewport lógico × deviceScaleFactor 2 = px finales
const SIZES = [
  { name: "16x9", w: 960, h: 540 },   // → 1920×1080
  { name: "4x3",  w: 800, h: 600 },   // → 1600×1200
  { name: "1x1",  w: 720, h: 720 },   // → 1440×1440
  { name: "191x1", w: 800, h: 419 },  // → 1600×838
];

const browser = await chromium.launch();
for (const s of SIZES) {
  const page = await browser.newPage({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
  });
  await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const out = path.join(OUT_DIR, `gbp-${s.name}.png`);
  await page.screenshot({ path: out });
  console.log("OK", out);
  await page.close();
}
await browser.close();
