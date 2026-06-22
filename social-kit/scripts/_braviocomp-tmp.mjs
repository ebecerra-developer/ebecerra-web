import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

// Compone el clip de OBS de bravío (scroll inmersivo real) sobre la base GSAP, dentro de la
// pantalla del móvil ampliado, durante su ventana (5.95–7.45s). Máscara redondeada para casar.
const ROOT = path.resolve("..");
const REEL = path.join(ROOT, "personal/2026/06/23-reel-demos-v2");
const base = path.join(REEL, "final.mp4");
const clip = path.join(ROOT, "personal/2026/06/09-reel-demos/2026-06-08 23-58-16.mp4");
const mask = path.join(REEL, "_maskbravio.png");
const out = path.join(REEL, "_final-bravio.mp4");

const WIN = { start: 5.85, end: 8.25 };
const SCREEN = { x: 211, y: 338, w: 658, h: 1244 };
const CLIP_START = 2.5;
const dur = (WIN.end - WIN.start + 0.1).toFixed(2);

const filter =
  `[1:v]trim=start=${CLIP_START}:duration=${dur},setpts=PTS-STARTPTS+${WIN.start}/TB,` +
  `scale=${SCREEN.w}:${SCREEN.h}:force_original_aspect_ratio=increase,crop=${SCREEN.w}:${SCREEN.h},setsar=1[v];` +
  `[2:v]alphaextract[a];[v][a]alphamerge[vm];` +
  `[0:v][vm]overlay=${SCREEN.x}:${SCREEN.y}:enable='between(t,${WIN.start},${WIN.end})',format=yuv420p[o]`;

const r = spawnSync(ffmpeg, [
  "-y", "-i", base, "-i", clip, "-i", mask,
  "-filter_complex", filter,
  "-map", "[o]", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-movflags", "+faststart",
  out,
], { encoding: "utf8" });
if (r.status !== 0) { console.log("FAIL", r.stderr.split("\n").slice(-8).join("\n")); process.exit(1); }
fs.renameSync(out, base);
console.log("OK → bravío compuesto en", base);
