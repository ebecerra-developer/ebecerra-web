// One-shot content patch for ebecerra.es — 2026-05-20.
// Patches heroSection (pain-led title + 'Hablemos 30 min' CTA + lead refresh)
// and servicesPricing (Google reviews/maps/FAQ bullets + enterprise disclaimer).
//
// Usage from apps/es:
//   node --env-file=.env.local scripts/patch-content-2026-05-20.mjs           (dry run)
//   node --env-file=.env.local scripts/patch-content-2026-05-20.mjs --commit  (apply)
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const HERO_ID = "8d0cdc27-e77a-413f-97b3-295cffeeef0d";
const SERVICES_ID = "148cf08a-bfe2-4188-ad31-79784ca11853";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- Hero patch values --------------------------------------------------
const heroPatch = {
  title: localeStr(
    "Tienes negocio. Lo que no tienes es [circle]tiempo[/circle] para pelearte con tu web.",
    "You have a business. What you don't have is [circle]time[/circle] to wrestle with your website."
  ),
  lead: localeStr(
    "Hablas conmigo, no con un comercial. Construyo webs a medida que tu equipo mantiene solo, conectan con las herramientas que ya usas y siguen funcionando cuando crezcas.",
    "You talk to me, not a salesperson. I build tailored websites your team maintains on its own, that connect with the tools you already use, and that keep working as you grow."
  ),
  ctaPrimary: localeStr("Hablemos 30 min", "Let's talk · 30 min"),
};

// --- Services bullet rewrites ------------------------------------------
const newEsencialBullet2 = localeStr(
  "Responsive + formulario + reseñas y mapa de Google",
  "Responsive + contact form + Google reviews and map"
);
const newAvanzadoBookingBullet = localeStr(
  "Reservas online sincronizadas con Google Calendar y Doctoralia",
  "Online bookings synced with Google Calendar and Doctoralia"
);
const newFaqBulletEs = "FAQ que aparece directa en Google cuando alguien pregunta";
const newFaqBulletEn = "FAQ that shows directly in Google when people ask";

const newFaqFeature = (key) => ({
  _key: key,
  _type: "tierFeature",
  highlight: false,
  text: localeStr(newFaqBulletEs, newFaqBulletEn),
});

const newMigrationFootnote = localeTxt(
  "Migración de contenido adicional · Páginas estáticas adicionales (inicio, servicios, contacto, etc.): 15 €/página. Entradas de blog o contenido enriquecido: 25 €/entrada. Proyectos empresariales (intranets, portales, integraciones complejas) o webs con más de 30 páginas: presupuesto a medida tras una primera conversación.",
  "Additional content migration · Extra static pages (home, services, contact, etc.): €15/page. Blog posts or rich content entries: €25/entry. Enterprise projects (intranets, portals, complex integrations) or sites with more than 30 pages: custom quote after an initial conversation."
);

// --- Plan output --------------------------------------------------------
console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
console.log("[heroSection] set fields:");
console.log("  title.es      ←", heroPatch.title.es);
console.log("  title.en      ←", heroPatch.title.en);
console.log("  lead.es       ←", heroPatch.lead.es.slice(0, 80), "…");
console.log("  ctaPrimary.es ←", heroPatch.ctaPrimary.es);
console.log("  ctaPrimary.en ←", heroPatch.ctaPrimary.en);

console.log("\n[servicesPricing] set fields:");
console.log("  paths[contract].tiers[esencial].features[ce-2].text  ← Reseñas/mapa Google");
console.log("  paths[oneTime ].tiers[esencial].features[oe-2].text  ← Reseñas/mapa Google");
console.log("  paths[contract].tiers[avanzado].features[ca-2].text  ← Reservas sync Google/Doctoralia");
console.log("  paths[oneTime ].tiers[avanzado].features[oa-2].text  ← Reservas sync Google/Doctoralia");
console.log("  migrationFootnote                                    ← +disclaimer empresarial");

console.log("\n[servicesPricing] insert features:");
console.log("  +cp-7 (FAQ en Google) before cp-6 in path-contract / profesional");
console.log("  +op-7 (FAQ en Google) before op-6 in path-onetime  / profesional");

if (!COMMIT) {
  console.log("\nDry run — no changes applied. Pass --commit to apply.");
  process.exit(0);
}

// --- Apply --------------------------------------------------------------
const heroResult = await client
  .patch(HERO_ID)
  .set({
    title: heroPatch.title,
    lead: heroPatch.lead,
    ctaPrimary: heroPatch.ctaPrimary,
  })
  .commit();
console.log("\n✓ heroSection patched, new _rev:", heroResult._rev);

const servicesResult = await client
  .patch(SERVICES_ID)
  .set({
    'paths[_key=="path-contract"].tiers[_key=="contract-esencial"].features[_key=="ce-2"].text': newEsencialBullet2,
    'paths[_key=="path-onetime"].tiers[_key=="onetime-esencial"].features[_key=="oe-2"].text': newEsencialBullet2,
    'paths[_key=="path-contract"].tiers[_key=="contract-avanzado"].features[_key=="ca-2"].text': newAvanzadoBookingBullet,
    'paths[_key=="path-onetime"].tiers[_key=="onetime-avanzado"].features[_key=="oa-2"].text': newAvanzadoBookingBullet,
    migrationFootnote: newMigrationFootnote,
  })
  .insert(
    "before",
    'paths[_key=="path-contract"].tiers[_key=="contract-profesional"].features[_key=="cp-6"]',
    [newFaqFeature("cp-7")]
  )
  .insert(
    "before",
    'paths[_key=="path-onetime"].tiers[_key=="onetime-profesional"].features[_key=="op-6"]',
    [newFaqFeature("op-7")]
  )
  .commit();
console.log("✓ servicesPricing patched, new _rev:", servicesResult._rev);
