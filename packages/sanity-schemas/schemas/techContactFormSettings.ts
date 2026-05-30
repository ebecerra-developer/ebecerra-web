import { defineType, defineField } from "sanity";

// Singleton del formulario de contacto de ebecerra.tech.
// Mismo patrón que contactFormSettings (ebecerra.es), scope tech.
export default defineType({
  name: "techContactFormSettings",
  title: "Tech · Contacto · Formulario",
  type: "document",
  fields: [
    defineField({
      name: "steps",
      title: "Pasos del wizard",
      type: "array",
      of: [{ type: "reference", to: [{ type: "techContactFormStep" }] }],
    }),
    defineField({ name: "submitLabel", title: "Botón · Enviar", type: "localeString" }),
    defineField({ name: "sendingLabel", title: "Botón · Enviando…", type: "localeString" }),
    defineField({ name: "gdprLabel", title: "Texto checkbox GDPR", type: "localeString" }),
    defineField({ name: "honeypotLabel", title: "Honeypot", type: "localeString" }),
    defineField({ name: "successMessage", title: "Mensaje de éxito", type: "localeString" }),
    defineField({ name: "errorMessage", title: "Mensaje de error", type: "localeString" }),
    defineField({ name: "missingRequiredMessage", title: "Mensaje · Faltan obligatorios", type: "localeString" }),
  ],
  preview: { prepare: () => ({ title: "Tech · Contacto · Formulario" }) },
});
