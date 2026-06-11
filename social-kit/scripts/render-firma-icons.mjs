import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

// Renderiza los iconos circulares de la firma de correo (verde bosque + glifo
// crema, coherentes con el círculo eB de las piezas sociales) y los deja en
// apps/es/public/firma/ para servirlos desde https://ebecerra.es/firma/.
//
// Glifos: Bootstrap Icons (MIT) vía jsDelivr — se inyectan inline para
// poder pintarlos con el crema de marca.

const OUT_DIR = path.resolve(import.meta.dirname, "../../apps/es/public/firma");
const ICONS = ["whatsapp", "instagram", "linkedin", "facebook"];
const CIRCLE = "#047857"; // --cta (verde bosque)
const GLYPH = "#f6f1e9";  // --cream
const SIZE = 256;          // fuente 256px → se muestra a ~26px (retina-crisp)

fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE } });

for (const name of ICONS) {
  const svg = await fetch(
    `https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/${name}.svg`
  ).then((r) => {
    if (!r.ok) throw new Error(`No se pudo descargar el glifo ${name}: ${r.status}`);
    return r.text();
  });

  await page.setContent(`<!doctype html>
    <html><head><style>
      html, body { margin: 0; background: transparent; }
      .circle {
        width: ${SIZE}px; height: ${SIZE}px; border-radius: 50%;
        background: ${CIRCLE};
        display: flex; align-items: center; justify-content: center;
        color: ${GLYPH};
      }
      .circle svg { width: ${Math.round(SIZE * 0.52)}px; height: ${Math.round(SIZE * 0.52)}px; }
    </style></head>
    <body><div class="circle">${svg}</div></body></html>`);

  await page.locator(".circle").screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    omitBackground: true,
  });
  console.log(`✓ ${name}.png`);
}

await browser.close();
console.log(`Iconos en ${OUT_DIR}`);
