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
  { name: "0003-story-chatbot",       folder: "personal/2026/05/0003-story-chatbot",       duration: 12 },
  { name: "0006-reel-rescate",        folder: "personal/2026/05/0006-reel-rescate",        duration: 18 },
  { name: "0007-reel-3puertas",       folder: "personal/2026/05/0007-reel-3puertas",       duration: 18 },
  { name: "0008-story-velocidad",     folder: "personal/2026/05/0008-story-velocidad",     duration: 12 },
  { name: "0009-story-aeo",           folder: "personal/2026/05/0009-story-aeo",           duration: 12 },
  { name: "0010-story-quien-soy",     folder: "personal/2026/05/0010-story-quien-soy",     duration: 10 },
  { name: "0011-story-por-que-ahora", folder: "personal/2026/05/0011-story-por-que-ahora", duration: 10 },
  { name: "0012-story-lo-que-cuesta", folder: "personal/2026/05/0012-story-lo-que-cuesta", duration: 10 },
  { name: "0013-story-madrid",        folder: "personal/2026/05/0013-story-madrid",        duration: 8  },
  // NOTA: el `duration` total = duración animación + 2-3 s de "hold" al final
  // para que el usuario tenga tiempo de leer el CTA y tocar el sticker.
  // Si la animación termina en T s, poner T+3.
  { name: "0014-story-seo-glosario",  folder: "personal/2026/05/0014-story-seo-glosario",  duration: 14 },
  { name: "0015-story-blog-announce", folder: "personal/2026/05/0015-story-blog-announce", duration: 12 },
  { name: "0016-story-servicios-2-caminos", folder: "personal/2026/05/0016-story-servicios-2-caminos", duration: 13 },
  // Pregunta + sticker IG nativo (hold largo final para que voten antes del auto-advance)
  { name: "0017-story-pregunta-pago", folder: "personal/2026/05/0017-story-pregunta-pago", duration: 12 },
  // Reel 0019: reservas online (18s anim + 3s hold final sobre CTA)
  { name: "0019-reel-reservas-equilibrio", folder: "personal/2026/05/0019-reel-reservas-equilibrio", duration: 20 },
  // Story 0020: animada con screenshots REALES del widget de reservas (6 frames + hold)
  { name: "0020-story-reservas-real", folder: "personal/2026/05/0020-story-reservas-real", duration: 15 },
  // Story 0022: pregunta abierta + sticker Questions IG (10s, hold 2.5s)
  { name: "0022-story-pregunta-ideas", folder: "personal/2026/05/0022-story-pregunta-ideas", duration: 10 },
  // Reel 0023: tu web es un currante más (3 escenas + CTA, 14s)
  { name: "0023-reel-web-currante", folder: "personal/2026/05/0023-reel-web-currante", duration: 14 },
  // Reel 2026-06-04: "Lo que cree mi madre que hago" (humor, 5 escenas + hold final ~2.4s)
  { name: "04-reel-madre-cree", folder: "personal/2026/06/04-reel-madre-cree", duration: 17 },
  // Reel 2026-06-09: "Demos" (apertura de semana, lidera Bravío + 4 demos + CTA demo gratis)
  { name: "09-reel-demos", folder: "personal/2026/06/09-reel-demos", duration: 20 },
  // Reel 2026-06-11: "90 min = una demo" (gancho Mundial, conecta con el de demos)
  { name: "11-reel-mundial-demo", folder: "personal/2026/06/11-reel-mundial-demo", duration: 17 },
  // Portada animada del reel de demos (cards desplegándose) → escena 0 del reel compuesto
  { name: "09-cover", folder: "personal/2026/06/09-reel-demos/_cover", duration: 2.9 },
  // Reel 2026-06-16: anuncio "Una web distinta para cada negocio" (collage mixto móvil+desktop, lento, 14.5s)
  { name: "16-reel-cada-negocio", folder: "personal/2026/06/16-reel-cada-negocio", duration: 14.5 },
  // Reel "anochece" (marca: ventana día→noche→amanecer + reloj 7-seg + bocadillos, 23.5s). Subido 22-jun.
  { name: "22-reel-anochece", folder: "personal/2026/06/22-reel-anochece", duration: 23.5 },
  // Reel 2026-06-23: demos (rejilla entra desde lados → zoom+scroll real de cada demo → CTA, organic-first)
  { name: "23-reel-demos-v2", folder: "personal/2026/06/23-reel-demos-v2", duration: 20 },
  // Reel 2026-07-07: footer 2019 (web abandonada falsa auto-scroll → rodea © 2019 → comment-bait)
  { name: "07-reel-footer-2019", folder: "personal/2026/07/07-reel-footer-2019", duration: 16.8 },
  // Reel 2026-07-09: boceto→web (4 capas cross-fade: boceto → wireframe → diseño → web real de Marta Solana)
  { name: "09-reel-boceto-web", folder: "personal/2026/07/09-reel-boceto-web", duration: 15 },
  // Reel 2026-07-14: A/B a medida vs plantilla (2 móviles scroll paralelo: plantilla genérica vs demo Equilibrio)
  { name: "14-reel-medida-vs-plantilla", folder: "personal/2026/07/14-reel-medida-vs-plantilla", duration: 14 },
  // Reel 2026-07-15: ¿Web o tienda online? (decidir según lo que vende el negocio, escenas cross-fade)
  { name: "15-reel-web-o-tienda", folder: "personal/2026/07/15-reel-web-o-tienda", duration: 18.5 },
  // Reel 2026-07-22: vacaciones (una buena web te deja desconectar; portada micro-zoom, 5 escenas + hold)
  { name: "22-reel-vacaciones", folder: "personal/2026/07/22-reel-vacaciones", duration: 18 },
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
    // El paso a yuv420p (submuestreo croma + rango tv) dessatura un pelín el
    // verde respecto a los PNG estáticos. Compensamos con un boost suave de
    // saturación para que los Reels casen con los posts.
    "-vf", "eq=saturation=1.12",
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
