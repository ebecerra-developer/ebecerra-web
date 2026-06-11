import ffmpeg from "ffmpeg-static";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REEL = path.resolve("../personal/2026/06/09-reel-demos");
const B = path.join(REEL, "_build");
const VID = "c:/temp/vid";
const bg = path.join(B, "bg.png");

// escenas: full (vídeo 1080x1920 ya compuesto), o video (ruta o null) + ss + sc + overlay
const S = [
  { full: path.join(REEL, "_cover", "final.mp4"), dur: 2.9 },                                        // PORTADA animada (cards desplegándose)
  { v: path.join(REEL, "2026-06-08 23-58-16.mp4"), ss: 1.0, dur: 3.6, sc: "scale=-2:1600", ov: 1 }, // Bravio movil + hook
  { v: path.join(REEL, "2026-06-09 00-01-39.mp4"), ss: 7.0, dur: 3.6, sc: "scale=1000:-2", ov: 2 }, // Bravio desktop
  { v: null, dur: 3.0, ov: 3 },                                                                      // transicion (mas tiempo para leer)
  { v: path.join(VID, "scroll-eco.mp4"), ss: 3.0, dur: 2.7, sc: "crop=in_w:ih-58:0:58,scale=-2:1500", ov: 4 },
  { v: path.join(VID, "scroll-equilibrio.mp4"), ss: 9.8, dur: 2.4, sc: "crop=in_w:ih-118:0:118,scale=-2:1500", ov: 5 }, // fisio · hero "Cuida tu cuerpo. Sin parches." (banner cropeado)
  { v: path.join(VID, "scroll-equilibrio.mp4"), ss: 13.9, dur: 2.5, sc: "crop=in_w:ih-58:0:58,scale=-2:1500", ov: 9 }, // fisio · sistema de reservas integrado
  { v: path.join(VID, "scroll-marta-solana.mp4"), ss: 3.0, dur: 2.7, sc: "crop=in_w:ih-58:0:58,scale=-2:1500", ov: 6 },
  { v: path.join(VID, "scroll-claudia-entrena.mp4"), ss: 3.0, dur: 2.7, sc: "crop=in_w:ih-58:0:58,scale=-2:1500", ov: 7 },
  { v: null, dur: 3.8, ov: 8 },                                                                      // CTA
];

const scenes = [];
S.forEach((s, idx) => {
  const out = path.join(B, `scene-${idx}.mp4`);
  const ov = path.join(B, `ov-${s.ov}.png`);
  let args;
  if (s.full) {
    args = ["-y", "-t", String(s.dur), "-i", s.full,
      "-filter_complex", `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p[o]`,
      "-map", "[o]", "-an", "-r", "30", "-t", String(s.dur), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", out];
  } else if (s.img) {
    args = ["-y", "-loop", "1", "-t", String(s.dur), "-i", s.img,
      "-filter_complex", `[0:v]format=yuv420p[o]`,
      "-map", "[o]", "-an", "-r", "30", "-t", String(s.dur), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", out];
  } else if (s.v) {
    args = ["-y", "-loop", "1", "-t", String(s.dur), "-i", bg,
      "-ss", String(s.ss), "-t", String(s.dur), "-i", s.v,
      "-loop", "1", "-t", String(s.dur), "-i", ov,
      "-filter_complex",
      `[1:v]${s.sc},setsar=1[v];[0:v][v]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[t];[t][2:v]overlay=0:0,format=yuv420p[o]`,
      "-map", "[o]", "-an", "-r", "30", "-t", String(s.dur), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", out];
  } else {
    args = ["-y", "-loop", "1", "-t", String(s.dur), "-i", bg,
      "-loop", "1", "-t", String(s.dur), "-i", ov,
      "-filter_complex", `[0:v][1:v]overlay=0:0,format=yuv420p[o]`,
      "-map", "[o]", "-an", "-r", "30", "-t", String(s.dur), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", out];
  }
  const r = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (r.status !== 0) { console.log("FAIL scene", idx, r.stderr.split("\n").slice(-4).join(" | ")); process.exit(1); }
  console.log("scene", idx, "ok");
  scenes.push(out);
});

// ensamblado con crossfades (xfade) entre escenas
const finalOut = path.join(REEL, "final.mp4");
// transiciones entre escenas; la de Bravío móvil→desktop más larga y suave
const Tarr = [0.5, 0.9, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const durs = S.map((s) => s.dur);
const inputs = [];
scenes.forEach((s) => inputs.push("-i", s));
let prev = "0:v", acc = durs[0], chain = "";
for (let i = 1; i < scenes.length; i++) {
  const T = Tarr[i - 1];
  const offset = (acc - T).toFixed(3);
  const out = `x${i}`;
  chain += `[${prev}][${i}:v]xfade=transition=fade:duration=${T}:offset=${offset}[${out}];`;
  prev = out; acc = acc + durs[i] - T;
}
const filter = chain + `[${prev}]eq=saturation=1.08,format=yuv420p[final]`;
const rc = spawnSync(ffmpeg, ["-y", ...inputs, "-filter_complex", filter,
  "-map", "[final]", "-r", "30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", finalOut], { encoding: "utf8" });
if (rc.status !== 0) { console.log("FAIL xfade", rc.stderr.split("\n").slice(-6).join(" | ")); process.exit(1); }
// poster: frame de portada ya asentado (cards + textos visibles), antes del 1er crossfade
spawnSync(ffmpeg, ["-y", "-ss", "2.4", "-i", finalOut, "-frames:v", "1", path.join(REEL, "poster.png"), "-loglevel", "error"]);
const dur = spawnSync(ffmpeg, ["-i", finalOut], { encoding: "utf8" }).stderr.match(/Duration: ([0-9:.]+)/);
console.log("FINAL ->", finalOut, "dur", dur && dur[1]);
