// One-shot content patch for ebecerra.es — 2026-05-29.
// Replaces the "Esencial" tier in both paths (contract + oneTime) with a new
// entry-level "Landing" tier (single page + CTA) at a lower price point.
// Also updates 4 FAQ items that reference the old Esencial tier or pricing.
//
// Usage from apps/es:
//   node --env-file=.env.local scripts/patch-landing-tier-2026-05-29.mjs           (dry run)
//   node --env-file=.env.local scripts/patch-landing-tier-2026-05-29.mjs --commit  (apply)
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const SERVICES_ID = "148cf08a-bfe2-4188-ad31-79784ca11853";

// FAQ ids fetched 2026-05-29
const FAQ_DIFF_ID = "b572830e-9762-4e2a-a478-ff78482abe13"; // order 10
const FAQ_TIME_ID = "3c51c2e5-4a30-46b5-b573-e8599f8753ed"; // order 20
const FAQ_PAY_ID = "51040df9-5241-42ec-8f73-4da9d0d87161"; // order 30
const FAQ_MAINT_ID = "f94500bd-5f57-494e-a5e8-99f3ca3e7083"; // order 60

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- New Landing tier objects -----------------------------------------------

// Features for Landing (contract path) — preserve _keys so React keys stay stable
const contractLandingFeatures = [
  {
    _key: "ce-1",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Una página con un CTA claro (formulario o WhatsApp)",
      "Single page with a clear CTA (form or WhatsApp)"
    ),
  },
  {
    _key: "ce-2",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Diseño a medida, sin plantillas, mobile-first",
      "Custom design, no templates, mobile-first"
    ),
  },
  {
    _key: "ce-3",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "SEO técnico básico (meta, sitemap, datos estructurados)",
      "Basic technical SEO (meta, sitemap, structured data)"
    ),
  },
  {
    _key: "ce-4",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Hosting + SSL + dominio incluido (primer año)",
      "Hosting + SSL + domain included (first year)"
    ),
  },
  {
    _key: "ce-5",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "30 min de cambios al mes",
      "30 min of changes per month"
    ),
  },
];

const contractLandingTier = {
  _key: "contract-esencial",
  _type: "pricingTier",
  id: "landing",
  name: localeStr("Landing", "Landing"),
  priceMain: "199 €",
  priceSecondary: localeStr("+ 19 €/mes", "+ €19/mo"),
  conditions: localeStr(
    "Permanencia mínima: 12 meses",
    "12-month minimum term"
  ),
  features: contractLandingFeatures,
  highlighted: false,
  badge: null,
};

// Features for Landing (oneTime path)
const oneTimeLandingFeatures = [
  {
    _key: "oe-1",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Una página con un CTA claro (formulario o WhatsApp)",
      "Single page with a clear CTA (form or WhatsApp)"
    ),
  },
  {
    _key: "oe-2",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Diseño a medida, sin plantillas, mobile-first",
      "Custom design, no templates, mobile-first"
    ),
  },
  {
    _key: "oe-3",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "SEO técnico básico (meta, sitemap, datos estructurados)",
      "Basic technical SEO (meta, sitemap, structured data)"
    ),
  },
  {
    _key: "oe-4",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Código y dominio 100% del cliente",
      "Code and domain 100% yours"
    ),
  },
  {
    _key: "oe-5",
    _type: "tierFeature",
    highlight: false,
    text: localeStr(
      "Mantenimiento opcional: +29 €/mes",
      "Optional maintenance: +€29/mo"
    ),
  },
];

const oneTimeLandingTier = {
  _key: "onetime-esencial",
  _type: "pricingTier",
  id: "landing",
  name: localeStr("Landing", "Landing"),
  priceMain: "399 €",
  priceSecondary: null,
  conditions: localeStr(
    "Incluye 1 mes de soporte post-entrega",
    "Includes 1 month of post-delivery support"
  ),
  features: oneTimeLandingFeatures,
  highlighted: false,
  badge: null,
};

// --- FAQ rewrites ------------------------------------------------------------

const faqDiffQ = localeStr(
  "¿Cuál es la diferencia entre los tiers Landing, Profesional y Avanzado?",
  "What's the difference between Landing, Professional and Advanced tiers?"
);

const faqDiffA = localeTxt(
  "Landing es una página única con un CTA claro (formulario o WhatsApp): ideal para autónomos que quieren estar online rápido y captar contactos sin invertir mucho. Profesional añade web a medida con más secciones, un CMS propio para que tu equipo publique sin llamarme, formación de uso y FAQ marcado para Google. Avanzado incluye además sistema de reservas online sincronizado con Google Calendar (o Doctoralia) y un add-on a elegir (chatbot, pagos, etc.). En el camino Compra directa los precios son 399 / 1.500 / 2.000 €; en Contrato de servicio son 199 / 699 / 999 € de alta + 19 / 69 / 89 €/mes.",
  "Landing is a single page with a clear CTA (form or WhatsApp): ideal for freelancers who want to be online fast and capture leads without investing much. Professional adds a custom multi-section website with a CMS so your team can publish without calling me, usage training and a Google-ready FAQ. Advanced also includes an online booking system synced with Google Calendar (or Doctoralia) and one add-on of your choice (chatbot, payments, etc.). In the Direct purchase path prices are €399 / €1,500 / €2,000; in Service contract they are €199 / €699 / €999 setup + €19 / €69 / €89/mo."
);

const faqTimeA = localeTxt(
  "Depende del tier. Landing se entrega en 1-2 semanas. Profesional y Avanzado en 4-6 semanas. Un rescate de una web antigua (proyecto a medida fuera de catálogo) puede ir a 2-3 meses según lo que haya que mover y reescribir. En la primera conversación te doy un plazo concreto con hitos semanales, no un rango vago.",
  "Depends on the tier. Landing ships in 1-2 weeks. Professional and Advanced in 4-6 weeks. Rescuing an old site (custom project off-catalogue) can take 2-3 months depending on what needs to be moved and rewritten. In the first conversation I give you a concrete timeline with weekly milestones, not a vague range."
);

const faqPayA = localeTxt(
  "En Compra directa: 50 % al firmar el presupuesto (reserva de calendario y arranque) y 50 % a la entrega en producción. En Contrato de servicio: pago de alta (199 / 699 / 999 €) al firmar y cuota mensual (19 / 69 / 89 €) facturada al inicio de cada mes, con permanencia mínima de 12 meses. En proyectos a medida largos (rescates de webs antiguas, intranets): 30 / 40 / 30 con hitos acordados. Todo por transferencia, con factura e IVA incluido en el precio mostrado.",
  "Direct purchase: 50% on quote acceptance (calendar reservation and kick-off) and 50% on production delivery. Service contract: setup payment (€199 / €699 / €999) on signing plus monthly fee (€19 / €69 / €89) invoiced at the start of each month, with a 12-month minimum term. Custom long projects (legacy rescues, intranets): 30 / 40 / 30 with agreed milestones. Everything by bank transfer, with an invoice — VAT is included in the prices shown."
);

const faqMaintA = localeTxt(
  "Si has elegido Compra directa, tu web es 100 % tuya desde el día 1. Landing incluye 1 mes de soporte post-entrega; Profesional y Avanzado, 3 meses. Después puedes contratar mantenimiento opcional aparte (29 / 69 / 89 €/mes según el tier) o gestionarla por tu cuenta. Si has elegido Contrato de servicio, el mantenimiento ya va incluido en la cuota mensual durante toda la vigencia del contrato (mínimo 12 meses).",
  "If you chose Direct purchase, your site is 100% yours from day 1. Landing includes 1 month of post-delivery support; Professional and Advanced, 3 months. After that you can contract optional maintenance separately (€29 / €69 / €89/mo by tier) or manage it yourself. If you chose Service contract, maintenance is already included in the monthly fee for the entire contract duration (12-month minimum)."
);

// --- Plan output -------------------------------------------------------------

console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
console.log("[servicesPricing] replace Esencial tier with Landing:");
console.log("  contract path:");
console.log("    id            esencial → landing");
console.log("    priceMain     399 €    → 199 €");
console.log("    priceSecondary + 49 €/mes → + 19 €/mes");
console.log("    features      5 nuevas (one-page focus)");
console.log("  oneTime path:");
console.log("    id            esencial → landing");
console.log("    priceMain     900 €    → 399 €");
console.log("    conditions    3 meses post-entrega → 1 mes post-entrega");
console.log("    mantenimiento opcional +49 €/mes → +29 €/mes");

console.log("\n[faqItem] updates:");
console.log("  order 10  diferencia entre tiers      → mention Landing");
console.log("  order 20  cuánto tarda                 → Landing 1-2 semanas");
console.log("  order 30  cómo se paga                 → nuevos precios");
console.log("  order 60  quién mantiene               → nuevos precios + soporte");

if (!COMMIT) {
  console.log("\n(dry run — no changes applied. Re-run with --commit)\n");
  process.exit(0);
}

// --- Commit ------------------------------------------------------------------

console.log("\nApplying patches…\n");

await client
  .patch(SERVICES_ID)
  .set({
    'paths[_key=="path-contract"].tiers[_key=="contract-esencial"]':
      contractLandingTier,
    'paths[_key=="path-onetime"].tiers[_key=="onetime-esencial"]':
      oneTimeLandingTier,
  })
  .commit();
console.log("  ✓ servicesPricing patched");

await client
  .patch(FAQ_DIFF_ID)
  .set({ question: faqDiffQ, answer: faqDiffA })
  .commit();
console.log("  ✓ faqItem (order 10) patched");

await client
  .patch(FAQ_TIME_ID)
  .set({ answer: faqTimeA })
  .commit();
console.log("  ✓ faqItem (order 20) patched");

await client
  .patch(FAQ_PAY_ID)
  .set({ answer: faqPayA })
  .commit();
console.log("  ✓ faqItem (order 30) patched");

await client
  .patch(FAQ_MAINT_ID)
  .set({ answer: faqMaintA })
  .commit();
console.log("  ✓ faqItem (order 60) patched");

console.log("\nDone.\n");
