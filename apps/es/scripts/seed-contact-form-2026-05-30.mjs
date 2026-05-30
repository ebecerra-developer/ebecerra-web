// Seed contact form wizard ebecerra.es — 2026-05-30 (Fase 2).
//
// Crea:
//  - contactFormStep-s1: paso único con 3 campos (name, email, message).
//  - contactFormSettings-singleton: referencia al step + mensajes globales.
//
// Idempotente. Usa createOrReplace.
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-contact-form-2026-05-30.mjs           (dry run)
//   node --env-file=.env.local scripts/seed-contact-form-2026-05-30.mjs --commit  (apply)
//
// Requiere SANITY_API_TOKEN con permisos write y schema deployado antes.

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const STEP_ID = "contactFormStep-s1";
const SETTINGS_ID = "contactFormSettings-singleton";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

const stepDoc = {
  _id: STEP_ID,
  _type: "contactFormStep",
  stepIndex: 1,
  title: localeStr("Cuéntame qué necesitas", "Tell me what you need"),
  description: localeStr(
    "Te respondo en 24 h laborables.",
    "I reply within 24 business hours."
  ),
  kind: "fields",
  fields: [
    {
      _type: "contactField",
      _key: "f-name",
      key: "s1_name",
      type: "text",
      label: localeStr("Nombre", "Name"),
      placeholder: localeStr("Cómo te llamas", "What's your name"),
      required: true,
      columns: 1,
      autoComplete: "name",
      inputMode: "text",
    },
    {
      _type: "contactField",
      _key: "f-email",
      key: "s1_email",
      type: "email",
      label: localeStr("Email", "Email"),
      placeholder: localeStr("tu@correo.com", "you@email.com"),
      required: true,
      columns: 1,
      autoComplete: "email",
      inputMode: "email",
    },
    {
      _type: "contactField",
      _key: "f-message",
      key: "s1_message",
      type: "textarea",
      label: localeStr("Mensaje", "Message"),
      placeholder: localeStr(
        "Cuéntame brevemente qué necesitas",
        "Tell me briefly what you need"
      ),
      required: true,
      columns: 1,
    },
  ],
};

const settingsDoc = {
  _id: SETTINGS_ID,
  _type: "contactFormSettings",
  steps: [
    {
      _type: "reference",
      _key: "step-s1",
      _ref: STEP_ID,
    },
  ],
  submitLabel: localeStr("Enviar mensaje", "Send message"),
  sendingLabel: localeStr("Enviando…", "Sending…"),
  gdprLabel: localeStr(
    "Al enviar este formulario aceptas la política de privacidad. Tus datos solo se usan para responderte.",
    "By submitting this form you accept the privacy policy. Your data is only used to reply to you."
  ),
  honeypotLabel: localeStr("Website (no rellenar)", "Website (do not fill)"),
  successMessage: localeStr(
    "Mensaje enviado. Te respondo en 24 h laborables.",
    "Message sent. I'll reply within 24 business hours."
  ),
  errorMessage: localeStr(
    "Error al enviar. Prueba escribiéndome a contacto@ebecerra.es.",
    "Failed to send. Try emailing me at contacto@ebecerra.es instead."
  ),
  missingRequiredMessage: localeStr(
    "Faltan campos obligatorios.",
    "Some required fields are missing."
  ),
};

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }

  console.log(`Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
  if (!COMMIT) {
    console.log("\n--- step ---");
    console.log(JSON.stringify(stepDoc, null, 2));
    console.log("\n--- settings ---");
    console.log(JSON.stringify(settingsDoc, null, 2));
    console.log("\nRun with --commit to write to Sanity.");
    return;
  }

  console.log("Writing contactFormStep-s1...");
  await client.createOrReplace(stepDoc);
  console.log("Writing contactFormSettings-singleton...");
  await client.createOrReplace(settingsDoc);

  console.log("\nDone. Contact form wizard seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
