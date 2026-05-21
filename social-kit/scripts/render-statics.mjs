import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "node:fs";

// Renderiza todas las piezas ESTÁTICAS (PNG) del social-kit.
// Las piezas animadas (Reels, Stories con GSAP) las graba record-animated.mjs.
//
// Cada job: { html: ruta relativa al social-kit/, out: ruta de salida, w, h }
// Output va dentro de la propia carpeta de la pieza o en highlights/covers.

const ROOT = path.resolve("..");

const JOBS = [
  // ── 0001 · Post Lo que NO hago (1080×1350) ───────────────────────────
  {
    html: "personal/0001-post-lo-que-no-hago/index.html",
    out:  "personal/0001-post-lo-que-no-hago/final.png",
    w: 1080, h: 1350,
  },

  // ── 0002 · Carrusel 4 demos · 7 slides 1080×1080 ─────────────────────
  // NOTA: este carrusel ya está publicado en formato cuadrado (1:1) del modelo
  // antiguo. NO regenerar a 4:5 — IG no permite cambiar el aspect ratio de un
  // post ya publicado, y los slides en pantalla seguirían siendo 1:1.
  // Los CARRUSELES NUEVOS deben usar 1080×1350 (4:5) — ver skill canónica.
  ...[1,2,3,4,5,6,7].map((n) => ({
    html: `personal/0002-carrusel-4-demos/slide-${n}.html`,
    out:  `personal/0002-carrusel-4-demos/slide-${n}.png`,
    w: 1080, h: 1080,
  })),

  // ── 0004 · Story eco estática (1080×1920) ────────────────────────────
  {
    html: "personal/0004-story-eco/index.html",
    out:  "personal/0004-story-eco/final.png",
    w: 1080, h: 1920,
  },

  // ── 0005 · Story pruébalos estática (1080×1920) ──────────────────────
  {
    html: "personal/0005-story-pruebalos/index.html",
    out:  "personal/0005-story-pruebalos/final.png",
    w: 1080, h: 1920,
  },

  // ── Covers de perfil ─────────────────────────────────────────────────
  {
    html: "personal/covers/fb-cover.html",
    out:  "personal/covers/fb-cover.png",
    w: 1640, h: 624,
  },
  {
    html: "personal/covers/gbp-cover.html",
    out:  "personal/covers/gbp-cover.png",
    w: 2048, h: 1080,
  },

  // ── Highlight covers (1080×1920) ─────────────────────────────────────
  ...[
    "sobre-mi",
    "servicios",
    "webs",
    "piezas",
    "proyectos",
    "contacto",
    "blog",
    "glosario",
  ].map((name) => ({
    html: `personal/highlights/${name}.html`,
    out:  `personal/highlights/${name}.png`,
    w: 1080, h: 1920,
  })),
];

const FILTER = process.argv[2]; // opcional: filtra por substring del path html

async function main() {
  const jobs = FILTER ? JOBS.filter(j => j.html.includes(FILTER)) : JOBS;
  if (jobs.length === 0) {
    console.error(`Ningún job coincide con "${FILTER}"`);
    process.exit(1);
  }
  console.log(`Rendering ${jobs.length} jobs…\n`);

  const browser = await chromium.launch({ headless: true });
  for (const job of jobs) {
    const htmlPath = path.join(ROOT, job.html);
    const outPath = path.join(ROOT, job.out);

    if (!fs.existsSync(htmlPath)) {
      console.warn(`⚠ skip (no existe): ${job.html}`);
      continue;
    }

    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const ctx = await browser.newContext({
      viewport: { width: job.w, height: job.h },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    const url = pathToFileURL(htmlPath).href;
    console.log(`→ ${job.html}`);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // fonts
    await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: job.w, height: job.h } });
    console.log(`  ✓ ${job.out}`);
    await ctx.close();
  }
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
