import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// Captura dedicada de equilibrio (fisio): un clip con DOS segmentos para dos escenas del reel.
//   1) hold arriba del todo  -> banner/hero ("Reserva tu sesión")
//   2) scroll suave al widget -> "Con sistema de reservas integrado"
const OUT_DIR = "c:/temp/vid";
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) if (f.endsWith(".webm")) fs.rmSync(path.join(OUT_DIR, f));

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 440, height: 956 },
  deviceScaleFactor: 2,
  isMobile: true, hasTouch: true,
  recordVideo: { dir: OUT_DIR, size: { width: 440, height: 956 } },
});
const page = await ctx.newPage();
await page.goto("https://demos.ebecerra.es/equilibrio/", { waitUntil: "load", timeout: 60000 });
await page.waitForTimeout(8500); // hidratar + cargar widget de reservas

try {
  // 1) arriba del todo (hero/banner) y hold
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2600);
  // 2) scroll suave hasta el widget de reservas (localizar por texto "Elige un servicio")
  await page.evaluate(async () => {
    const heading = [...document.querySelectorAll("h1,h2,h3")].find((h) => /elige un servicio|reserva tu sesi/i.test(h.textContent || ""));
    const target = heading ? Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 90) : 1800;
    await new Promise((res) => {
      const from = window.scrollY, dur = 2600, start = performance.now();
      function step(t) {
        const p = Math.min(1, (t - start) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        scrollTo(0, from + e * (target - from));
        if (p < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  });
  await page.waitForTimeout(1700); // hold sobre el widget
} catch (e) { console.log("(interrumpido)", String(e.message).slice(0, 60)); }

await ctx.close();
const webm = fs.readdirSync(OUT_DIR).find((f) => f.endsWith(".webm"));
const mp4 = path.join(OUT_DIR, "scroll-equilibrio.mp4");
spawnSync(ffmpeg, ["-y", "-i", path.join(OUT_DIR, webm), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", mp4], { stdio: "ignore" });
await browser.close();
console.log("ok ->", mp4);
