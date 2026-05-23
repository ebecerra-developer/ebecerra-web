import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

// Captura el modal de reservas REAL en demos.ebecerra.es/equilibrio.
// Usado por la story 0020-story-reservas-real (cumple regla de veracidad:
// la story enseña lo que el cliente verá si toca el link sticker).
//
// IMPORTANTE: este script depende del sistema de reservas estando LIVE.
// Si los selectores cambian al desplegarse, ajustar SELECTORS abajo.
//
// Uso:  node capture-booking-modal.mjs
// Salida: ../personal/assets/captures/demo-equilibrio-booking-modal.png

const URL = "https://demos.ebecerra.es/equilibrio/";
const OUT = path.resolve("../personal/assets/captures/demo-equilibrio-booking-modal.png");

// Selectores tentativos — ajustar tras ver el sistema desplegado.
// Pensados para ser robustos: getByRole/getByText antes que CSS frágil.
const SELECTORS = {
  // CTA principal que abre el modal de reservas en la home equilibrio
  openBookingCta: [
    'role=button[name=/pide.+cita|primera.+sesi[oó]n|reservar/i]',
    'role=link[name=/pide.+cita|primera.+sesi[oó]n|reservar/i]',
    'text=/^Pide tu (primera )?(cita|sesi[oó]n)/i',
    'text=/Reservar (cita|online)/i',
  ],
  // Día disponible dentro del modal (cualquier botón con número 1-28 marcado disponible)
  // Si el sistema usa otra estructura, ajustar aquí.
  bookingDay: [
    'role=button[name=/^(2[0-5]|1[0-9])$/]',
    '[data-available="true"]',
    '.cal__day--available, .day--available, [aria-label*="disponible"]',
  ],
  // Hora disponible (queremos algo "social", tipo 17:00 o 18:00)
  bookingHour: [
    'role=button[name=/17:00|18:00|19:00/]',
    'text=/17:00|18:00|19:00/',
  ],
};

async function tryClick(page, selectors, label) {
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.isVisible({ timeout: 1500 })) {
        await loc.click();
        console.log(`  ✓ clicked ${label} via ${sel}`);
        return true;
      }
    } catch {
      // try next
    }
  }
  console.warn(`  ⚠ no encontré ${label} con ningún selector — ajusta SELECTORS.${label}`);
  return false;
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    // Viewport mobile alto — la captura encajará dentro del phone mockup 9:19.5
    // del story 0020. 390×844 es iPhone 14 Pro estándar; con DSR 3 → 1170×2532 nativos.
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();

  console.log(`→ ${URL}`);
  await page.goto(URL, { waitUntil: "networkidle", timeout: 45000 });

  // Quitar DemoBanner (top "Esta web es un ejemplo") — no queremos que aparezca
  await page.evaluate(() => {
    const region = [...document.querySelectorAll('[role="region"]')].find((el) =>
      /ejemplo|example/i.test(el.textContent || "")
    );
    region?.remove();
  });
  await page.waitForTimeout(600);

  // 1) Abrir modal de reservas
  const opened = await tryClick(page, SELECTORS.openBookingCta, "openBookingCta");
  if (!opened) {
    console.error("FATAL: no pude abrir el modal de reservas. Aborto.");
    console.error("Revisa el HTML de la home equilibrio y actualiza SELECTORS.openBookingCta.");
    await browser.close();
    process.exit(1);
  }
  await page.waitForTimeout(800);

  // 2) Seleccionar un día disponible
  await tryClick(page, SELECTORS.bookingDay, "bookingDay");
  await page.waitForTimeout(500);

  // 3) Seleccionar una hora (preferencia: tarde, 17:00-19:00)
  await tryClick(page, SELECTORS.bookingHour, "bookingHour");
  await page.waitForTimeout(500);

  // 4) Screenshot — toda la viewport con modal en su estado "a punto de confirmar"
  await page.screenshot({ path: OUT, fullPage: false });
  console.log(`✓ saved: ${OUT}`);

  await browser.close();
  console.log("");
  console.log("Siguiente paso:");
  console.log("  1) Editar personal/0020-story-reservas-real/index.html — cambiar src del <img>");
  console.log("     de  ../assets/captures/demo-equilibrio-mobile.png");
  console.log("     a   ../assets/captures/demo-equilibrio-booking-modal.png");
  console.log("  2) node render-statics.mjs 0020-story-reservas-real");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
