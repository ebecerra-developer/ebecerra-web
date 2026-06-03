import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

// Genera avatares eB a 1024×1024 desde el vector (nítido, no reescalado).
// Output a la carpeta de binarios del workspace raíz.

const BRAND = path.resolve("../apps/es/public/brand");
const whiteSvg = fs.readFileSync(path.join(BRAND, "logo-white.svg"), "utf8");
const greenSvg = fs.readFileSync(path.join(BRAND, "logo-green.svg"), "utf8");
const OUT = "C:/GIT/ebecerra-environment/ebecerra-web/social-kit/personal/assets/avatars";

const GREEN = "#047857";
const CREAM = "#FAF6EE";

// Ancho del eB dentro del cuadro (se ajusta para igualar al 512 existente)
const GLYPH_WIDTH = "64%";

const variants = [
  { name: "green", bg: GREEN, svg: whiteSvg, omit: false },
  { name: "cream", bg: CREAM, svg: greenSvg, omit: false },
  { name: "white-transparent", bg: "transparent", svg: whiteSvg, omit: true },
];

const html = (bg, svg) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1024px;height:1024px}
.av{width:1024px;height:1024px;background:${bg};display:flex;align-items:center;justify-content:center}
.av svg{width:${GLYPH_WIDTH};height:auto;display:block}
</style></head><body><div class="av">${svg}</div></body></html>`;

const browser = await chromium.launch();
for (const v of variants) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  await page.setContent(html(v.bg, v.svg), { waitUntil: "networkidle" });
  const out = path.join(OUT, `avatar-eB-${v.name}-1024.png`);
  await page.screenshot({ path: out, omitBackground: v.omit });
  console.log("OK", out);
  await page.close();
}
await browser.close();
