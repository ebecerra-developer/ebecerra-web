import { defineType, defineField } from "sanity";

export default defineType({
  name: "techSiteSettings",
  title: "Tech · Ajustes del sitio",
  type: "document",
  groups: [
    { name: "metadata", title: "Metadata / SEO" },
    { name: "nav", title: "Nav" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "metadata",
      title: "Metadata / SEO",
      type: "object",
      group: "metadata",
      fields: [
        defineField({ name: "title", title: "Título por defecto", type: "localeString" }),
        defineField({
          name: "titleTemplate",
          title: "Plantilla de título",
          description: "Ej: %s · ebecerra.tech",
          type: "string",
        }),
        defineField({ name: "description", title: "Meta description", type: "localeString" }),
        defineField({ name: "ogDescription", title: "Descripción OpenGraph", type: "localeString" }),
        defineField({ name: "twitterDescription", title: "Descripción Twitter", type: "localeString" }),
        defineField({
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "localeString" }],
        }),
      ],
    }),
    defineField({
      name: "nav",
      title: "Nav",
      type: "object",
      group: "nav",
      fields: [
        defineField({
          name: "items",
          title: "Enlaces del nav",
          description: "Anchors a secciones del home (key sin #).",
          type: "array",
          of: [
            {
              name: "techNavItem",
              type: "object",
              fields: [
                defineField({
                  name: "key",
                  title: "Key (id de la sección)",
                  description: "Ej: home, quien_soy, trayectoria, stack, proyectos, contactar",
                  type: "string",
                  validation: (R) => R.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta (./xxx)",
                  type: "localeString",
                  validation: (R) => R.required(),
                }),
              ],
              preview: {
                select: { title: "label.es", subtitle: "key" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "—",
                  subtitle: `#${subtitle ?? ""}`,
                }),
              },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      group: "footer",
      fields: [
        defineField({
          name: "copyrightTemplate",
          title: "Plantilla copyright",
          description:
            "Usa {year} para el año actual. Ej: © {year} ebecerra.tech.",
          type: "localeString",
        }),
        defineField({ name: "online", title: "Status online", type: "localeString" }),
        defineField({ name: "version", title: "Versión", type: "string" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Tech · Ajustes del sitio" }) },
});
