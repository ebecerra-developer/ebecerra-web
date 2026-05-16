import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FFMPEG = require("ffmpeg-static");

const ROOT = path.resolve("..");

// Cada pieza animada es una carpeta autocontenida en personal/NNNN-tipo-slug/:
//   - index.html         (fuente)
//   - final.mp4          (output, ignored en git)
//   - poster.png         (output, ignored en git)
//   - captions.md        (caption + alt + comentario fijado)
// El recorder solo necesita la carpeta + duración. html/out/poster se infieren.

const TARGETS = [
  { name: "0003-story-chatbot",       folder: "personal/0003-story-chatbot",       duration: 12 },
  { name: "0006-reel-rescate",        folder: "personal/0006-reel-rescate",        duration: 18 },
  { name: "0007-reel-3puertas",       folder: "personal/0007-reel-3puertas",       duration: 18 },
  { name: "0008-story-velocidad",     folder: "personal/0008-story-velocidad",     duration: 12 },
  { name: "0009-story-aeo",           folder: "personal/0009-story-aeo",           duration: 12 },
  { name: "0010-story-quien-soy",     folder: "personal/0010-story-quien-soy",     duration: 10 },
  { name: "0011-story-por-que-ahora", folder: "personal/0011-story-por-que-ahora", duration: 10 },
  { name: "0012-story-lo-que-cuesta", folder: "personal/0012-story-lo-que-cuesta", duration: 10 },
  { name: "0013-story-madrid",        folder: "personal/0013-story-madrid",        duration: 8  },
].map(t => ({
  ...t,
  html:   `${t.folder}/index.html`,
  out:    `${t.folder}/final.mp4`,
  poster: `${t.folder}/poster.png`,
}));

const FPS = 30;
const ARG = process.argv[2];

async function record(target) {
  const html = path.join(ROOT, target.html);
  const outPath = path.join(ROOT, target.out);
  const posterPath = path.join(ROOT, target.poster);
  const tmpDir = path.join(ROOT, `${target.folder}/_tmp-frames`);
  const frames = FPS * target.duration;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`\n=== ${target.name} ===`);
  console.log(`html: ${html}`);
  console.log(`frames: ${frames} @ ${FPS}fps`);

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // fonts + images settle

  // Deterministic capture: timeline stays paused, seek per frame
  // (Real-time capture races vs ~80ms screenshot cost on 1080x1920.)
  await page.evaluate(() => {
    if (window.gsap) window.gsap.ticker.lagSmoothing(0);
  });

  for (let i = 0; i < frames; i++) {
    const t = i / FPS;
    await page.evaluate((time) => {
      if (window.__tl) window.__tl.seek(time, false);
    }, t);
    // Let rAF flush
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const file = path.join(tmpDir, `frame-${String(i).padStart(4, "0")}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (i % 30 === 0) console.log(`  frame ${i}/${frames}`);
  }

  await browser.close();

  console.log(`Encoding mp4...`);
  const r = spawnSync(FFMPEG, [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(tmpDir, "frame-%04d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "20",
    "-preset", "medium",
    "-movflags", "+faststart",
    outPath,
  ], { stdio: "inherit" });
  if (r.status !== 0) { console.error("ffmpeg failed"); process.exit(1); }

  // Poster from first scene (~1.2s in) — usable as IG custom cover
  const posterIdx = Math.min(Math.floor(FPS * 1.2), frames - 1);
  const posterFrame = path.join(tmpDir, `frame-${String(posterIdx).padStart(4, "0")}.png`);
  fs.copyFileSync(posterFrame, posterPath);

  fs.rmSync(tmpDir, { recursive: true });
  console.log(`✓ ${outPath}`);
  console.log(`✓ ${posterPath}`);
}

async function main() {
  const list = ARG ? TARGETS.filter(t => t.name === ARG) : TARGETS;
  if (list.length === 0) {
    console.error(`No target matches "${ARG}". Available: ${TARGETS.map(t => t.name).join(", ")}`);
    process.exit(1);
  }
  for (const t of list) await record(t);
}

main().catch(e => { console.error(e); process.exit(1); });
