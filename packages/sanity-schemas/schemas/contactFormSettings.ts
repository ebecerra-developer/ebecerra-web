import { defineType, defineField } from "sanity";

/**
 * Singleton del formulario de contacto de ebecerra.es.
 *
 * Contiene la lista ordenada de pasos (referencias a `contactFormStep`)
 * + los mensajes globales del wizard (botón submit, sending, success,
 * error, missing-required, GDPR, honeypot). Todo editable sin redeploy.
 *
 * Política: si Sanity está caído, el componente cae al fallback en
 * lib/queries.ts con el copy actual; si Sanity responde con `steps: []`,
 * el componente no renderiza el wizard.
 */
export default defineType({
  name: "contactFormSettings",
  title: "Contacto · Formulario (wizard)",
  type: "document",
  fields: [
    defineField({
      name: "steps",
      title: "Pasos del wizard",
      type: "array",
      of: [{ type: "reference", to: [{ type: "contactFormStep" }] }],
      description: "Orden importa. Hoy: 1 paso. Mañana: N pasos.",
    }),

    defineField({ name: "submitLabel", title: "Botón · Enviar", type: "localeString" }),
    defineField({ name: "sendingLabel", title: "Botón · Enviando…", type: "localeString" }),
    defineField({ name: "gdprLabel", title: "Texto checkbox GDPR", type: "localeString" }),
    defineField({
      name: "honeypotLabel",
      title: "Honeypot (oculto)",
      type: "localeString",
      description:
        "Texto del label oculto del honeypot. No es visible pero los lectores de pantalla lo anuncian — manténlo neutro.",
    }),
    defineField({ name: "successMessage", title: "Mensaje de éxito", type: "localeString" }),
    defineField({ name: "errorMessage", title: "Mensaje de error genérico", type: "localeString" }),
    defineField({
      name: "missingRequiredMessage",
      title: "Mensaje · Faltan campos obligatorios",
      type: "localeString",
      description:
        "Se muestra si el usuario intenta enviar sin completar campos required.",
    }),
  ],
  preview: { prepare: () => ({ title: "Contacto · Formulario (wizard)" }) },
});
