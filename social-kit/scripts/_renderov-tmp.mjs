import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

// Renderiza _overlays.html → _build/bg.png (opaco) + _build/ov-1..9.png (transparente).
const REEL = path.resolve("../personal/2026/06/09-reel-demos");
const HTML = path.join(REEL, "_overlays.html");
const B = path.join(REEL, "_build");
fs.mkdirSync(B, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

async function shot(s, out, omit) {
  await page.goto(pathToFileURL(HTML).href + `?s=${s}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, omitBackground: omit, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
  console.log("ok", out);
}

await shot("bg", path.join(B, "bg.png"), false);
for (let i = 1; i <= 9; i++) await shot(String(i), path.join(B, `ov-${i}.png`), true);

await browser.close();
console.log("done");
