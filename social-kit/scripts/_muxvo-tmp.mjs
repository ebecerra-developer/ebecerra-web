import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");

// Monta la narración (VO de ElevenLabs) sobre el reel → versión "anuncio".
// El vídeo (20s) se alarga un poco manteniendo el último frame para cubrir la voz (20.9s).
const REEL = path.resolve("../personal/2026/06/23-reel-demos-v2");
const video = path.join(REEL, "final.mp4");
const mp3 = fs.readdirSync(REEL).find((f) => f.endsWith(".mp3"));
const audio = path.join(REEL, mp3);
const out = path.join(REEL, "final-anuncio.mp4");

const r = spawnSync(ffmpeg, [
  "-y", "-i", video, "-i", audio,
  "-filter_complex", "[0:v]tpad=stop_mode=clone:stop_duration=1.3[v]",
  "-map", "[v]", "-map", "1:a",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
  "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart",
  out,
], { encoding: "utf8" });
if (r.status !== 0) { console.log("FAIL", r.stderr.split("\n").slice(-6).join("\n")); process.exit(1); }
const d = spawnSync(ffmpeg, ["-i", out], { encoding: "utf8" }).stderr.match(/Duration: ([0-9:.]+)/);
console.log("OK →", out, "dur", d && d[1]);
