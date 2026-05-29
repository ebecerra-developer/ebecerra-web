// Sync cancellationClause + profile.chatbot.systemPrompt to the new
// Landing-tier pricing model (2026-05-29).
//
// Usage from apps/es:
//   node --env-file=.env.local scripts/patch-clause-chatbot-2026-05-29.mjs           (dry run)
//   node --env-file=.env.local scripts/patch-clause-chatbot-2026-05-29.mjs --commit
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

const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- New cancellation clause body -------------------------------------------
// One-time prices changed: Landing 900€ → 399€. Profesional 1500€ and
// Avanzado 2000€ unchanged.

const newClauseBody = localeTxt(
  "El valor base de la web equivale al precio de pago único del tier correspondiente (399 / 1.500 / 2.000 €). Si cancelas antes de cumplir los 12 meses, se liquida la diferencia entre lo abonado y ese valor base. Esto se te explica antes de firmar, nunca en letra pequeña.",
  "The base value of the website equals the one-time price of its tier (€399 / €1,500 / €2,000). If you cancel before the 12-month term ends, you settle the difference between what you've paid so far and that base value. You're told this before signing — never in fine print."
);

// --- Chatbot system prompt rewrites (ES + EN) -------------------------------
// We do targeted string replaces against the live prompt to keep the rest of
// the prompt intact. If any expected fragment is missing the script aborts
// before committing — guards against re-running after a manual edit.

async function loadPrompt() {
  return client.fetch(`*[_id == $id][0]{ "es": chatbot.systemPrompt.es, "en": chatbot.systemPrompt.en }`, { id: PROFILE_ID });
}

const replacementsES = [
  {
    from: `- Esencial — 399 € + 49 €/mes. Diseño a medida, responsive, formulario de contacto, hosting + SSL + seguridad, hasta 1 h de cambios al mes, dominio incluido el primer año.`,
    to: `- Landing — 199 € + 19 €/mes. Una página única con un CTA claro (formulario o WhatsApp), diseño a medida mobile-first, SEO técnico básico, hosting + SSL + dominio el primer año, 30 min de cambios al mes.`,
  },
  {
    from: `- Profesional — 699 € + 69 €/mes (el más contratado). Lo anterior + panel CMS para editar tú, hasta 2 h de cambios/mes, 1 h de formación al entregar, soporte con respuesta en 24 h, migración de hasta 5 páginas incluida.`,
    to: `- Profesional — 699 € + 69 €/mes (el más contratado). Web a medida multi-sección con panel CMS para editar tú, hasta 2 h de cambios/mes, 1 h de formación al entregar, soporte con respuesta en 24 h, migración de hasta 5 páginas incluida.`,
  },
  {
    from: `## Camino B — Pago único (incluye 3 meses de soporte post-entrega)
- Esencial — 900 €. Equivalente al Esencial contrato pagado de una vez. Código y dominio 100 % del cliente, traspaso completo de cuentas. Mantenimiento opcional desde +49 €/mes.
- Profesional — 1.500 € (el más contratado). Equivalente al Profesional contrato. Mantenimiento opcional +69 €/mes. Migración de hasta 5 páginas incluida.
- Avanzado — 2.000 €. Equivalente al Avanzado contrato. Mantenimiento opcional +89 €/mes. Migración de hasta 10 páginas incluida.`,
    to: `## Camino B — Pago único (código y dominio 100 % del cliente)
- Landing — 399 €. Equivalente al Landing contrato pagado de una vez. Incluye 1 mes de soporte post-entrega. Mantenimiento opcional desde +29 €/mes.
- Profesional — 1.500 € (el más contratado). Equivalente al Profesional contrato. Incluye 3 meses de soporte post-entrega. Mantenimiento opcional +69 €/mes. Migración de hasta 5 páginas incluida.
- Avanzado — 2.000 €. Equivalente al Avanzado contrato. Incluye 3 meses de soporte post-entrega. Mantenimiento opcional +89 €/mes. Migración de hasta 10 páginas incluida.`,
  },
  {
    from: `Si cancelas antes de cumplir los 12 meses, se liquida la diferencia entre lo abonado y el valor base del tier — que equivale al precio de pago único (900 / 1.500 / 2.000 €). Esto se explica antes de firmar, nunca en letra pequeña.`,
    to: `Si cancelas antes de cumplir los 12 meses, se liquida la diferencia entre lo abonado y el valor base del tier — que equivale al precio de pago único (399 / 1.500 / 2.000 €). Esto se explica antes de firmar, nunca en letra pequeña.`,
  },
  {
    from: `4) Entrega y autonomía — producción + formación + 3 meses de soporte (pago único) o soporte continuo dentro de la cuota (contrato). Después Enrique sigue a un email.`,
    to: `4) Entrega y autonomía — producción + formación + soporte post-entrega (1 mes en Landing, 3 meses en Profesional/Avanzado) o soporte continuo dentro de la cuota (contrato). Después Enrique sigue a un email.`,
  },
  {
    from: `- Pago único: 30 % al firmar · 40 % en hito intermedio · 30 % a la entrega. Sin adelantos del 100 %.`,
    to: `- Pago único: 50 % al firmar el presupuesto · 50 % a la entrega en producción. Sin adelantos del 100 %. En proyectos a medida largos (rescates, intranets): 30 / 40 / 30 con hitos acordados.`,
  },
  {
    from: `- Explicar la diferencia entre contrato y pago único, y entre tiers (Esencial / Profesional / Avanzado).`,
    to: `- Explicar la diferencia entre contrato y pago único, y entre tiers (Landing / Profesional / Avanzado).`,
  },
];

const replacementsEN = [
  {
    from: `- Essential — €399 + €49/mo. Custom design, responsive, contact form, hosting + SSL + security, up to 1 h of changes per month, domain included for the first year.`,
    to: `- Landing — €199 + €19/mo. Single page with a clear CTA (form or WhatsApp), custom mobile-first design, basic technical SEO, hosting + SSL + domain for the first year, 30 min of changes per month.`,
  },
  {
    from: `- Professional — €699 + €69/mo (most popular). Everything above + CMS panel so you edit yourself, up to 2 h of changes/month, 1 h of training on delivery, 24 h support response, content migration of up to 5 pages included.`,
    to: `- Professional — €699 + €69/mo (most popular). Custom multi-section website with CMS panel so you edit yourself, up to 2 h of changes/month, 1 h of training on delivery, 24 h support response, content migration of up to 5 pages included.`,
  },
  {
    from: `## Path B — One-time payment (includes 3 months of post-delivery support)
- Essential — €900. Equivalent to Essential contract paid up front. Code and domain 100 % yours, full handover of all accounts. Optional maintenance from +€49/mo.
- Professional — €1,500 (most popular). Equivalent to Professional contract. Optional maintenance +€69/mo. Content migration of up to 5 pages included.
- Advanced — €2,000. Equivalent to Advanced contract. Optional maintenance +€89/mo. Content migration of up to 10 pages included.`,
    to: `## Path B — One-time payment (code and domain 100 % yours)
- Landing — €399. Equivalent to Landing contract paid up front. Includes 1 month of post-delivery support. Optional maintenance from +€29/mo.
- Professional — €1,500 (most popular). Equivalent to Professional contract. Includes 3 months of post-delivery support. Optional maintenance +€69/mo. Content migration of up to 5 pages included.
- Advanced — €2,000. Equivalent to Advanced contract. Includes 3 months of post-delivery support. Optional maintenance +€89/mo. Content migration of up to 10 pages included.`,
  },
  {
    from: `If you cancel before the 12-month term ends, you settle the difference between what you've paid and the tier's base value — which equals the one-time price (€900 / €1,500 / €2,000). This is spelled out before signing, never in fine print.`,
    to: `If you cancel before the 12-month term ends, you settle the difference between what you've paid and the tier's base value — which equals the one-time price (€399 / €1,500 / €2,000). This is spelled out before signing, never in fine print.`,
  },
  {
    from: `4) Delivery and autonomy — production + training + 3 months support (one-time) or ongoing support inside the monthly fee (contract). After that Enrique is still one email away.`,
    to: `4) Delivery and autonomy — production + training + post-delivery support (1 month for Landing, 3 months for Professional/Advanced) or ongoing support inside the monthly fee (contract). After that Enrique is still one email away.`,
  },
  {
    from: `- One-time payment: 30 % on signing · 40 % at mid-milestone · 30 % on delivery. No 100 % upfront.`,
    to: `- One-time payment: 50 % on quote acceptance · 50 % on production delivery. No 100 % upfront. For long custom projects (legacy rescues, intranets): 30 / 40 / 30 with agreed milestones.`,
  },
  {
    from: `- Explain the difference between contract and one-time, and between tiers (Essential / Professional / Advanced).`,
    to: `- Explain the difference between contract and one-time, and between tiers (Landing / Professional / Advanced).`,
  },
];

function applyReplacements(text, reps, label) {
  let out = text;
  for (const r of reps) {
    if (!out.includes(r.from)) {
      console.error(`[${label}] expected fragment not found:\n---\n${r.from}\n---`);
      process.exit(1);
    }
    out = out.replace(r.from, r.to);
  }
  return out;
}

console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}\n`);
console.log("[servicesPricing.cancellationClause.body]");
console.log("  Pago único base values: 900/1500/2000 € → 399/1500/2000 €");

console.log("\n[profile.chatbot.systemPrompt] verifying replacements…");
const prompt = await loadPrompt();
const newES = applyReplacements(prompt.es, replacementsES, "ES");
const newEN = applyReplacements(prompt.en, replacementsEN, "EN");
console.log(`  ES: ${prompt.es.length} → ${newES.length} chars`);
console.log(`  EN: ${prompt.en.length} → ${newEN.length} chars`);
console.log("  All expected fragments found and replaced ✓");

if (!COMMIT) {
  console.log("\n(dry run — re-run with --commit)\n");
  process.exit(0);
}

console.log("\nApplying patches…");
await client
  .patch(SERVICES_ID)
  .set({ "cancellationClause.body": newClauseBody })
  .commit();
console.log("  ✓ cancellationClause patched");

await client
  .patch(PROFILE_ID)
  .set({
    "chatbot.systemPrompt.es": newES,
    "chatbot.systemPrompt.en": newEN,
  })
  .commit();
console.log("  ✓ profile.chatbot.systemPrompt patched");

console.log("\nDone.\n");
