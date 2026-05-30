import { defineType, defineField } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
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
        defineField({
          name: "title",
          title: "Título por defecto",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "titleTemplate",
          title: "Plantilla de título",
          description: "Ej: %s · eBecerra",
          type: "string",
        }),
        defineField({
          name: "description",
          title: "Meta description",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: "ogDescription",
          title: "Descripción OpenGraph",
          type: "localeString",
        }),
        defineField({
          name: "twitterDescription",
          title: "Descripción Twitter",
          type: "localeString",
        }),
        defineField({
          name: "keywords",
          title: "Keywords",
          description:
            "Keywords bilingües. Consumidor en generateMetadata proyecta por locale.",
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
          description:
            "Items del nav top (orden = visual). Anchor = sección de la home (id sin #). Page = URL a otra página del sitio.",
          type: "array",
          of: [
            {
              name: "navAnchor",
              type: "object",
              title: "Anchor de sección",
              fields: [
                defineField({
                  name: "key",
                  title: "Key (id de la sección)",
                  description:
                    "Ej: servicios, sobre-mi, capacidades, proceso, ejemplos, contacto.",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
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
            {
              name: "navPage",
              type: "object",
              title: "Página",
              fields: [
                defineField({
                  name: "href",
                  title: "Href",
                  description: "Ej: /blog/, /faq, /ejemplos.",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: { title: "label.es", subtitle: "href" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "—",
                  subtitle,
                }),
              },
            },
          ],
        }),
        defineField({
          name: "ctaLabel",
          title: "CTA del nav",
          description: "Ej: Hablemos.",
          type: "localeString",
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
          name: "tagline",
          title: "Tagline",
          type: "localeText",
        }),
        defineField({
          name: "availability",
          title: "Disponibilidad",
          description: "Ej: disponible para que trabajemos juntos",
          type: "localeString",
        }),
        defineField({
          name: "email",
          title: "Email de contacto",
          description:
            "Aparece como enlace en la columna 'Síguenos' del footer. Ej: contacto@ebecerra.es",
          type: "string",
        }),
        defineField({
          name: "colNavTitle",
          title: "Título columna Navegación",
          description: "Ej: navegación",
          type: "localeString",
        }),
        defineField({
          name: "colSocialTitle",
          title: "Título columna Social",
          description: "Ej: social",
          type: "localeString",
        }),
        defineField({
          name: "colCrossTitle",
          title: "Título columna Ecosistema",
          description: "Ej: ecosistema ebecerra",
          type: "localeString",
        }),
        defineField({
          name: "navColumn",
          title: "Columna Navegación",
          description:
            "Enlaces del footer (anchors o páginas). Si está vacío, se reutilizan los items del nav top.",
          type: "array",
          of: [
            {
              name: "footerAnchor",
              type: "object",
              title: "Anchor de sección",
              fields: [
                defineField({
                  name: "key",
                  title: "Key (id de la sección)",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
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
            {
              name: "footerPage",
              type: "object",
              title: "Página",
              fields: [
                defineField({
                  name: "href",
                  title: "Href",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: {
                select: { title: "label.es", subtitle: "href" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "—",
                  subtitle,
                }),
              },
            },
          ],
        }),
        defineField({
          name: "socialLinks",
          title: "Enlaces sociales",
          description:
            "LinkedIn, Instagram, Facebook, Google Business, etc. Se renderizan en el footer y en sameAs de JSON-LD.",
          type: "array",
          of: [
            {
              name: "socialLink",
              type: "object",
              fields: [
                {
                  name: "name",
                  title: "Nombre (LinkedIn, Instagram, …)",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "url",
                  title: "URL",
                  type: "url",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "external",
                  title: "Abrir en nueva pestaña",
                  type: "boolean",
                  initialValue: true,
                },
              ],
              preview: {
                select: { title: "name", subtitle: "url" },
              },
            },
          ],
        }),
        defineField({
          name: "crossLinks",
          title: "Ecosistema (cross-links)",
          description:
            "Enlaces a otras webs del ecosistema (ebecerra.tech, piezas-game, etc.).",
          type: "array",
          of: [
            {
              name: "crossLink",
              type: "object",
              fields: [
                {
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "href",
                  title: "URL",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "external",
                  title: "Abrir en nueva pestaña",
                  type: "boolean",
                  initialValue: true,
                },
              ],
              preview: {
                select: { title: "label.es", subtitle: "href" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "—",
                  subtitle,
                }),
              },
            },
          ],
        }),
        defineField({
          name: "legalLinks",
          title: "Enlaces legales",
          description:
            "Línea inferior del footer (FAQ, privacidad, aviso legal, términos).",
          type: "array",
          of: [
            {
              name: "legalLink",
              type: "object",
              fields: [
                {
                  name: "label",
                  title: "Etiqueta",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                },
                {
                  name: "href",
                  title: "Href interno",
                  description: "Ej: /faq, /privacidad, /aviso-legal, /terminos.",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: { title: "label.es", subtitle: "href" },
                prepare: ({ title, subtitle }) => ({
                  title: title ?? "—",
                  subtitle,
                }),
              },
            },
          ],
        }),
        defineField({
          name: "copyrightTemplate",
          title: "Plantilla copyright",
          description:
            "Usa {year} para el año actual. Ej: © {year} Enrique Becerra · Madrid.",
          type: "localeString",
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ajustes del sitio" }),
  },
});
