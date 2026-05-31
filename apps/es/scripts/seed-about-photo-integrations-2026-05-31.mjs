// Sube la foto de Sobre mí + los logos de la franja de integraciones y crea
// el contenido (profile.aboutPhoto + integrationsStrip singleton).
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-about-photo-integrations-2026-05-31.mjs           (dry run)
//   node --env-file=.env.local scripts/seed-about-photo-integrations-2026-05-31.mjs --commit
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const COMMIT = process.argv.includes("--commit");

const PROFILE_ID = "136f3077-4754-470c-9f79-663097a57568";
const INTEGRATIONS_ID = "integrationsStrip-singleton";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });

// --- Foto de Sobre mí --------------------------------------------------------
const PHOTO_PATH = new URL(
  "../../../social-kit/personal/assets/yo/Quique-corporativo-sin-fondo.png",
  import.meta.url
);

// --- Logos de integraciones (monocromos, simple-icons) -----------------------
const INTEGRATIONS = [
  { name: "Google", file: "google.svg" },
  { name: "WhatsApp", file: "whatsapp.svg" },
  { name: "Stripe", file: "stripe.svg" },
  { name: "Instagram", file: "instagram.svg" },
  { name: "Google Calendar", file: "googlecalendar.svg" },
  { name: "Mailchimp", file: "mailchimp.svg" },
];

const HEADING = localeStr(
  "Se conecta con las herramientas que ya usas",
  "Works with the tools you already use"
);

console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);

const photoBuf = readFileSync(PHOTO_PATH);
console.log(`[profile.aboutPhoto] foto lista: ${photoBuf.length} bytes`);
console.log(`[integrationsStrip] heading: "${HEADING.es}"`);
for (const it of INTEGRATIONS) {
  const buf = readFileSync(new URL(`./assets/integrations/${it.file}`, import.meta.url));
  console.log(`  · ${it.name} (${it.file}, ${buf.length} bytes)`);
}

if (!COMMIT) {
  console.log("\n(dry run — re-run with --commit)\n");
  process.exit(0);
}

// --- Subir foto + patch profile ---------------------------------------------
console.log("\nSubiendo foto…");
const photoAsset = await client.assets.upload("image", photoBuf, {
  filename: "about-enrique.png",
  contentType: "image/png",
});
console.log(`  ✓ asset ${photoAsset._id}`);

await client
  .patch(PROFILE_ID)
  .set({
    aboutPhoto: {
      _type: "image",
      asset: { _type: "reference", _ref: photoAsset._id },
      alt: "Enrique Becerra, desarrollador web",
    },
  })
  .commit();
console.log("  ✓ profile.aboutPhoto patched");

// --- Subir logos + crear integrationsStrip ----------------------------------
console.log("\nSubiendo logos…");
const items = [];
for (const it of INTEGRATIONS) {
  const buf = readFileSync(new URL(`./assets/integrations/${it.file}`, import.meta.url));
  const asset = await client.assets.upload("image", buf, {
    filename: it.file,
    contentType: "image/svg+xml",
  });
  console.log(`  ✓ ${it.name} → ${asset._id}`);
  items.push({
    _type: "integration",
    _key: it.file.replace(/\W+/g, "-"),
    name: it.name,
    logo: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: it.name,
    },
  });
}

await client.createOrReplace({
  _id: INTEGRATIONS_ID,
  _type: "integrationsStrip",
  enabled: true,
  heading: HEADING,
  items,
});
console.log("  ✓ integrationsStrip singleton creado/actualizado");

console.log("\nDone.\n");
