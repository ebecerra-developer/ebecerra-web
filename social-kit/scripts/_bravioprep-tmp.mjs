import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

const ROOT = path.resolve("..");
const REEL = path.join(ROOT, "personal/2026/06/23-reel-demos-v2");
const html = path.join(REEL, "index.html");

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
const win = await page.evaluate(() => window.__bravioWin);
console.log("BRAVIO_WIN " + JSON.stringify(win));

// máscara: rectángulo redondeado blanco 658x1244 (radio 61) sobre transparente
await page.setContent('<body style="margin:0;background:transparent"><div id="m" style="width:658px;height:1244px;border-radius:61px;background:#fff"></div></body>');
const el = await page.$("#m");
const maskPath = path.join(REEL, "_maskbravio.png");
await el.screenshot({ path: maskPath, omitBackground: true });
console.log("MASK " + maskPath);
await browser.close();

// clip OBS móvil de bravío
const clip = path.join(ROOT, "personal/2026/06/09-reel-demos/2026-06-08 23-58-16.mp4");
console.log("CLIP_EXISTS " + fs.existsSync(clip));
const probe = spawnSync(ffmpeg, ["-i", clip], { encoding: "utf8" }).stderr;
const res = probe.match(/Video:.* (\d{2,}x\d{2,})/);
const dur = probe.match(/Duration: ([0-9:.]+)/);
console.log("CLIP_RES " + (res && res[1]) + " DUR " + (dur && dur[1]));
