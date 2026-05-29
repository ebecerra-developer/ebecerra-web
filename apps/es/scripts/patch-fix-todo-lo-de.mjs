// Fix lingering "Todo lo de Esencial" references in Profesional tiers
// after the Landing rename (2026-05-29).
//
// Usage from apps/es:
//   node --env-file=.env.local scripts/patch-fix-todo-lo-de.mjs --commit
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");
const SERVICES_ID = "148cf08a-bfe2-4188-ad31-79784ca11853";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });

const newProfesionalFirstFeature = localeStr(
  "Todo lo de Landing",
  "Everything in Landing"
);

console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
console.log("[servicesPricing] Fix Profesional features[0].text:");
console.log("  contract-profesional / cp-1  'Todo lo de Esencial' → 'Todo lo de Landing'");
console.log("  onetime-profesional / op-1   'Todo lo de Esencial' → 'Todo lo de Landing'");

if (!COMMIT) {
  console.log("\n(dry run — re-run with --commit)\n");
  process.exit(0);
}

await client
  .patch(SERVICES_ID)
  .set({
    'paths[_key=="path-contract"].tiers[_key=="contract-profesional"].features[_key=="cp-1"].text':
      newProfesionalFirstFeature,
    'paths[_key=="path-onetime"].tiers[_key=="onetime-profesional"].features[_key=="op-1"].text':
      newProfesionalFirstFeature,
  })
  .commit();

console.log("\n  ✓ servicesPricing patched\nDone.\n");
