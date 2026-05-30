// Seed Fase 4 demos.ebecerra.es — 2026-05-30.
//
// Crea:
//  - demosIndexPage-singleton (página índice)
//  - demosBannerSettings-singleton (banner global de demos)
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-demos-2026-05-30.mjs --commit

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

const indexPage = {
  _id: "demosIndexPage-singleton",
  _type: "demosIndexPage",
  title: localeStr("Demos de webs", "Website demos"),
  lead: localeTxt(
    "Ejemplos navegables de lo que podemos construir para tu negocio.",
    "Browsable examples of what we can build for your business."
  ),
  ctaBack: localeStr("Volver a ebecerra.es", "Back to ebecerra.es"),
};

const banner = {
  _id: "demosBannerSettings-singleton",
  _type: "demosBannerSettings",
  label: localeStr("Demo", "Demo"),
  text: localeStr(
    "Esta web es un ejemplo. No representa un negocio real.",
    "This website is an example. It doesn't represent a real business."
  ),
  ctaLabel: localeStr("Ver más demos", "See more demos"),
  ctaHref: "https://ebecerra.es/ejemplos",
};

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }
  console.log(`Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
  if (!COMMIT) {
    console.log("Would write 2 docs:");
    console.log(" -", indexPage._id);
    console.log(" -", banner._id);
    return;
  }
  console.log("Writing demosIndexPage...");
  await client.createOrReplace(indexPage);
  console.log("Writing demosBannerSettings...");
  await client.createOrReplace(banner);
  console.log("\nDone. Demos seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
