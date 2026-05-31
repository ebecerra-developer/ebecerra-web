// Reemplaza la palabra "tier"/"tiers" (jerga que el público PYME no entiende)
// por lenguaje claro en TODO el contenido visible de Sanity:
//   - faqItem (question/answer, es+en)
//   - servicesPricing.cancellationClause.body (es+en)
//   - profile.chatbot.systemPrompt (es+en)
//
// Mapeo: "tiers de complejidad" → "niveles de complejidad" (coincide con el
// lead de Servicios); el resto "tier(s)" → "plan(es)" / "plan(s)". En inglés
// "tiers of complexity" → "levels of complexity".
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/patch-tier-wording-2026-05-31.mjs           (dry run)
//   node --env-file=.env.local scripts/patch-tier-wording-2026-05-31.mjs --commit
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const SERVICES_ID = "148cf08a-bfe2-4188-ad31-79784ca11853";
const PROFILE_ID = "136f3077-4754-470c-9f79-663097a57568";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// "tier" solo aparece como préstamo aislado en estos textos, nunca como
// subcadena de otra palabra → replaceAll es seguro. El orden importa:
// frases específicas y plurales/posesivos antes que el singular.
function deTier(text, locale) {
  if (typeof text !== "string" || !text.includes("tier")) return text;
  let t = text;
  if (locale === "es") {
    t = t.replaceAll("tiers de complejidad", "niveles de complejidad");
    t = t.replaceAll("tiers", "planes");
    t = t.replaceAll("tier", "plan");
  } else {
    t = t.replaceAll("tiers of complexity", "levels of complexity");
    t = t.replaceAll("tier's", "plan's");
    t = t.replaceAll("tiers", "plans");
    t = t.replaceAll("tier", "plan");
  }
  return t;
}

const changes = []; // { id, path, before, after }

function plan(setObj, id, path, before, locale) {
  const after = deTier(before, locale);
  if (after !== before) {
    setObj[path] = after;
    changes.push({ id, path, before, after });
  }
}

// --- faqItem -----------------------------------------------------------------
const faqItems = await client.fetch(
  `*[_type == "faqItem"]{ _id, question, answer }`
);

const faqPatches = [];
for (const item of faqItems) {
  const set = {};
  plan(set, item._id, "question.es", item.question?.es, "es");
  plan(set, item._id, "question.en", item.question?.en, "en");
  plan(set, item._id, "answer.es", item.answer?.es, "es");
  plan(set, item._id, "answer.en", item.answer?.en, "en");
  if (Object.keys(set).length > 0) faqPatches.push({ id: item._id, set });
}

// --- servicesPricing.cancellationClause.body ---------------------------------
const services = await client.fetch(
  `*[_id == $id][0]{ "es": cancellationClause.body.es, "en": cancellationClause.body.en }`,
  { id: SERVICES_ID }
);
const servicesSet = {};
plan(servicesSet, SERVICES_ID, "cancellationClause.body.es", services?.es, "es");
plan(servicesSet, SERVICES_ID, "cancellationClause.body.en", services?.en, "en");

// --- profile.chatbot.systemPrompt --------------------------------------------
const profile = await client.fetch(
  `*[_id == $id][0]{ "es": chatbot.systemPrompt.es, "en": chatbot.systemPrompt.en }`,
  { id: PROFILE_ID }
);
const profileSet = {};
plan(profileSet, PROFILE_ID, "chatbot.systemPrompt.es", profile?.es, "es");
plan(profileSet, PROFILE_ID, "chatbot.systemPrompt.en", profile?.en, "en");

// --- Report ------------------------------------------------------------------
console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
console.log(`Total field changes: ${changes.length}\n`);
for (const c of changes) {
  // Muestra solo el contexto alrededor de la primera diferencia para no spamear.
  const idx = c.before.indexOf("tier");
  const ctxBefore = c.before.slice(Math.max(0, idx - 30), idx + 40);
  console.log(`  ${c.id}  ${c.path}`);
  console.log(`    …${ctxBefore.replace(/\n/g, " ")}…`);
}

if (changes.length === 0) {
  console.log("\nNada que cambiar (ya está limpio).\n");
  process.exit(0);
}

if (!COMMIT) {
  console.log("\n(dry run — re-run with --commit)\n");
  process.exit(0);
}

console.log("\nAplicando patches…");
for (const p of faqPatches) {
  await client.patch(p.id).set(p.set).commit();
  console.log(`  ✓ faqItem ${p.id} (${Object.keys(p.set).join(", ")})`);
}
if (Object.keys(servicesSet).length > 0) {
  await client.patch(SERVICES_ID).set(servicesSet).commit();
  console.log(`  ✓ servicesPricing cancellationClause`);
}
if (Object.keys(profileSet).length > 0) {
  await client.patch(PROFILE_ID).set(profileSet).commit();
  console.log(`  ✓ profile chatbot.systemPrompt`);
}
console.log("\nDone.\n");
