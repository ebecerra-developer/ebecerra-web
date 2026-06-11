import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Graba el scroll real de demos (móvil) + cursor sintético animado → mp4.
const SLUGS = process.argv.slice(2);
const OUT_DIR = "c:/temp/vid";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const SLUG of SLUGS) {
  // limpia webm previos
  for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(".webm")) fs.rmSync(path.join(OUT_DIR, f));

  const ctx = await browser.newContext({
    viewport: { width: 440, height: 956 },
    deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
    recordVideo: { dir: OUT_DIR, size: { width: 440, height: 956 } },
  });
  const page = await ctx.newPage();
  await page.goto(`https://demos.ebecerra.es/${SLUG}/`, { waitUntil: "load", timeout: 60000 });
  await page.waitForTimeout(8000); // hidratar + dejar cargar widgets (reserva) antes del scroll

  // scroll suave (~9s), sin cursor — tolerante a navegación
  try {
  await page.evaluate(async () => {
    await new Promise((res) => {
      const dur = 9000, start = performance.now();
      const max = () => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - innerHeight;
      function step(t) {
        const p = Math.min(1, (t - start) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        scrollTo(0, e * max());
        if (p < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  });
  } catch (e) { console.log("  (scroll interrumpido en", SLUG, "—", String(e.message).slice(0, 60), ")"); }
  await page.waitForTimeout(900);
  await ctx.close();

  const webm = fs.readdirSync(OUT_DIR).find((f) => f.endsWith(".webm"));
  const mp4Path = path.join(OUT_DIR, `scroll-${SLUG}.mp4`);
  spawnSync(ffmpeg, ["-y", "-i", path.join(OUT_DIR, webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", mp4Path], { stdio: "ignore" });
  spawnSync(ffmpeg, ["-y", "-ss", "5", "-i", mp4Path, "-frames:v", "1", `c:/temp/sc2-${SLUG}.png`, "-loglevel", "error"]);
  console.log("ok", SLUG, "->", mp4Path);
}
await browser.close();
console.log("done");
