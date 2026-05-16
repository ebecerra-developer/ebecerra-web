import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const FFMPEG = require("ffmpeg-static");

const ROOT = path.resolve("../..");
const HTML = path.join(ROOT, "_templates/stories/story-chatbot.html");
const OUT_DIR = path.join(ROOT, "personal/stories");
const TMP_DIR = path.join(ROOT, "personal/stories/_tmp-frames");
const FRAMES = 30 * 12; // 12s @ 30fps = 360 frames
const FPS = 30;

async function main() {
  if (fs.existsSync(TMP_DIR)) {
    fs.rmSync(TMP_DIR, { recursive: true });
  }
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  await page.goto(pathToFileURL(HTML).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(500); // settle fonts

  // Freeze animations and step them manually via clock control
  // Approach: animations are CSS keyframes triggered on load. We capture frames
  // at fixed intervals while CSS animations run in real time.

  const start = Date.now();
  const interval = 1000 / FPS;

  console.log(`Recording ${FRAMES} frames @ ${FPS}fps...`);

  for (let i = 0; i < FRAMES; i++) {
    const targetTime = start + i * interval;
    const wait = targetTime - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);

    const file = path.join(TMP_DIR, `frame-${String(i).padStart(4, "0")}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (i % 30 === 0) console.log(`  frame ${i}/${FRAMES}`);
  }

  await browser.close();

  console.log("Encoding mp4 via ffmpeg...");
  const mp4Out = path.join(OUT_DIR, "story-chatbot.mp4");
  const r = spawnSync(FFMPEG, [
    "-y",
    "-framerate", String(FPS),
    "-i", path.join(TMP_DIR, "frame-%04d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", "20",
    "-preset", "medium",
    "-movflags", "+faststart",
    mp4Out,
  ], { stdio: "inherit" });

  if (r.status !== 0) {
    console.error("ffmpeg failed");
    process.exit(1);
  }

  console.log(`Saved: ${mp4Out}`);

  // Also produce a poster frame (the last "final" frame) as a fallback PNG
  const posterIn = path.join(TMP_DIR, `frame-${String(FRAMES - 1).padStart(4, "0")}.png`);
  const posterOut = path.join(OUT_DIR, "story-chatbot-poster.png");
  fs.copyFileSync(posterIn, posterOut);
  console.log(`Saved poster: ${posterOut}`);

  // Cleanup frames
  fs.rmSync(TMP_DIR, { recursive: true });
}

main().catch((e) => { console.error(e); process.exit(1); });
