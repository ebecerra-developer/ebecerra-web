// Seed Fase 5 ebecerra.es — 2026-05-30 (repaso completo).
//
// Migra los textos que faltaban (kickers con numbering, copy del about,
// página de ejemplos, etc.) a Sanity. Idempotente.
//
// Uso:
//   node --env-file=.env.local scripts/seed-fase5-2026-05-30.mjs --commit

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const SITE_SETTINGS_ID = "de40d1fb-51ab-46d3-83c6-ffebefe05016";
const HERO_ID = "8d0cdc27-e77a-413f-97b3-295cffeeef0d";
const SERVICES_ID = "148cf08a-bfe2-4188-ad31-79784ca11853";
const SERVICE_META_ID = "a6675cf9-f20f-4741-82dc-f4f6f2504264";
const PROCESS_META_ID = "5e6bf4ca-36ba-4537-b015-b6cb7bf76fcc";
const CASES_META_ID = "3fbbc4f8-48c6-4adc-9ae8-15123db6a005";
const CONTACT_META_ID = "b2746aef-0e12-44a1-83b3-9ffe84551f32";
const CAPABILITIES_ID = "capabilitiesSection-singleton";
const EXAMPLES_PAGE_ID = "examplesPage-singleton";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- profile: añadir aboutKicker, aboutTitle, aboutViewProfileCta -----------

async function patchProfile() {
  const profiles = await client.fetch(`*[_type == "profile"]{ _id }`);
  if (profiles.length === 0) {
    console.warn("No profile doc found, skipping profile patch.");
    return;
  }
  for (const { _id } of profiles) {
    console.log(`Patching profile ${_id}...`);
    await client
      .patch(_id)
      .set({
        aboutKicker: localeStr("// 02. Sobre mí", "// 02. About"),
        aboutTitle: localeStr(
          "Hola, soy Enrique Becerra",
          "Hi, I'm Enrique Becerra"
        ),
        aboutViewProfileCta: localeStr(
          "Ver perfil completo",
          "View full profile"
        ),
      })
      .commit();
  }
}

// --- Kickers con numbering completo (hero no, no tiene número) --------------

const kickerPatches = [
  {
    id: HERO_ID,
    type: "heroSection",
    set: {
      kicker: localeStr(
        "// Disponible para que trabajemos juntos",
        "// Available to work together"
      ),
    },
  },
  {
    id: SERVICES_ID,
    type: "servicesPricing",
    set: {
      kicker: localeStr("// 01. Servicios", "// 01. Services"),
    },
  },
  {
    id: SERVICE_META_ID,
    type: "serviceSectionMeta",
    set: {
      kicker: localeStr("// 01. Servicios", "// 01. Services"),
    },
  },
  {
    id: CAPABILITIES_ID,
    type: "capabilitiesSection",
    set: {
      kicker: localeStr("// 03. Más que una web", "// 03. More than a website"),
    },
  },
  {
    id: PROCESS_META_ID,
    type: "processSectionMeta",
    set: {
      kicker: localeStr(
        "// 04. Cómo trabajamos juntos",
        "// 04. How we work together"
      ),
      title: localeStr(
        "De idea a sitio vivo en 4 pasos",
        "From idea to live site in 4 steps"
      ),
      lead: localeTxt(
        "Sin consultoría interminable ni sorpresas en la factura. Un camino corto, honesto y medible desde la primera llamada hasta que tu equipo opera la web solo.",
        "No endless consulting, no invoice surprises. A short, honest and measurable path from first call to your team running the site alone."
      ),
    },
  },
  {
    id: CASES_META_ID,
    type: "casesSectionMeta",
    set: {
      kicker: localeStr("// Casos destacados", "// Featured cases"),
    },
  },
  {
    id: CONTACT_META_ID,
    type: "contactSectionMeta",
    set: {
      kicker: localeStr("// 06. Contacto", "// 06. Contact"),
      title: localeStr(
        "Hablemos de tu proyecto",
        "Let's talk about your project"
      ),
      lead: localeTxt(
        "Cuéntame qué necesitas y te respondo en 24 h laborables con una primera idea del alcance.",
        "Tell me what you need and I'll reply within 24 business hours with a first take on scope."
      ),
    },
  },
];

// --- examplesPage completo --------------------------------------------------

const examplesPageDoc = {
  _id: EXAMPLES_PAGE_ID,
  _type: "examplesPage",
  metaTitle: localeStr(
    "Ejemplos de webs · Enrique Becerra",
    "Website examples · Enrique Becerra"
  ),
  metaDescription: localeStr(
    "Demos navegables de webs profesionales para autónomos, PYMEs y pequeños negocios. Mira lo que puedes tener antes de encargar.",
    "Browsable demos of professional websites for freelancers, SMBs and small businesses. See what you can have before commissioning yours."
  ),
  kicker: localeStr("// EJEMPLOS", "// EXAMPLES"),
  title: localeStr(
    "Ejemplos de webs reales para tu negocio",
    "Real website examples for your business"
  ),
  lead: localeTxt(
    "Demos completas para que veas qué puedes tener: agencia de marketing, coaching, clínica de fisioterapia… Cada una con su personalidad y su tono. La tuya nace de una conversación contigo, no de una plantilla.",
    "Complete demos so you can see what you can have: marketing agency, coaching, physiotherapy clinic… Each one with its own personality. Yours starts from a conversation with you, not from a template."
  ),
  ctaContact: localeStr("Empieza con la tuya", "Start yours"),
  homeKicker: localeStr("// 05. Ejemplos", "// 05. Examples"),
  homeTitle: localeStr(
    "Mira lo que puedes tener",
    "See what you can have"
  ),
  homeLead: localeTxt(
    "Demos completas y navegables de webs como las que entrego a autónomos, pequeños negocios y proyectos personales. Para que veas el resultado antes de encargar.",
    "Browsable, complete demos of websites like the ones I deliver to freelancers, small businesses and personal projects. So you see the result before commissioning."
  ),
  homeViewAll: localeStr("Ver todos los ejemplos", "See all examples"),
  emptyState: localeStr(
    "Demos en preparación. Vuelve pronto.",
    "Demos coming soon. Check back later."
  ),
  viewDemoLabel: localeStr("Ver demo", "Open demo"),
  openInNewTabLabel: localeStr(
    "(se abre en pestaña nueva)",
    "(opens in a new tab)"
  ),
  prevLabel: localeStr("Ejemplo anterior", "Previous example"),
  nextLabel: localeStr("Siguiente ejemplo", "Next example"),
};

// --- Run ---------------------------------------------------------------------

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }
  console.log(`Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
  if (!COMMIT) {
    console.log("\nKicker patches (orden):");
    kickerPatches.forEach((p) =>
      console.log(`  ${p.id} (${p.type}):`, JSON.stringify(p.set).slice(0, 80))
    );
    console.log("\nexamplesPage:", EXAMPLES_PAGE_ID);
    console.log("profile: aboutKicker + aboutTitle + aboutViewProfileCta");
    console.log("\nRun with --commit to write to Sanity.");
    return;
  }

  await patchProfile();

  for (const { id, type, set } of kickerPatches) {
    console.log(`Patching ${type} (${id})...`);
    await client.patch(id).set(set).commit();
  }

  console.log("Writing examplesPage...");
  await client.createOrReplace(examplesPageDoc);

  console.log("\nDone. Fase 5 seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
