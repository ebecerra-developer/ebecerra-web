import { defineType, defineField } from "sanity";

export default defineType({
  name: "demoSite",
  title: "Demo de web",
  type: "document",
  groups: [
    { name: "meta", title: "Meta", default: true },
    { name: "hero", title: "Portada" },
    { name: "about", title: "Sobre" },
    { name: "services", title: "Servicios" },
    { name: "team", title: "Equipo" },
    { name: "testimonials", title: "Testimonios" },
    { name: "contact", title: "Contacto" },
    { name: "gallery", title: "Galería" },
  ],
  fields: [
    // ---------- Meta ----------
    defineField({
      name: "businessName",
      title: "Nombre del negocio",
      type: "localeString",
      group: "meta",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "meta",
      options: {
        source: (doc) => (doc.businessName as { es?: string })?.es ?? "",
        maxLength: 80,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "template",
      title: "Plantilla",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "Fisioterapia", value: "fisio" },
          { title: "Clínica dental", value: "dental" },
          { title: "Despacho de abogados", value: "legal" },
          { title: "Coach / entrenador personal", value: "coach" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
      initialValue: "fisio",
    }),
    defineField({
      name: "enableEnglish",
      title: "Activar inglés",
      description:
        "Si está marcado, la demo muestra el switcher ES/EN y se rellenan los campos en inglés.",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "publishedToGallery",
      title: "Publicar en galería pública",
      description:
        "Si está activo, aparece en ebecerra.es/ejemplos. Si no, la demo es accesible solo con la URL directa.",
      type: "boolean",
      group: "meta",
      initialValue: false,
    }),
    defineField({
      name: "tagline",
      title: "Tagline corto",
      type: "localeString",
      group: "meta",
    }),
    defineField({
      name: "sector",
      title: "Sector (etiqueta para galería)",
      description: "Ej: Salud · Fisioterapia",
      type: "localeString",
      group: "meta",
    }),
    defineField({
      name: "shortDescription",
      title: "Descripción corta (galería)",
      type: "localeText",
      group: "meta",
    }),
    defineField({
      name: "thumbnail",
      title: "Miniatura (galería)",
      type: "image",
      group: "meta",
      options: { hotspot: true },
    }),
    defineField({
      name: "galleryOrder",
      title: "Orden en galería",
      type: "number",
      group: "meta",
      initialValue: 100,
    }),

    // ---------- Hero ----------
    defineField({
      name: "hero",
      title: "Portada",
      type: "object",
      group: "hero",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({
          name: "heading",
          title: "Titular",
          type: "localeString",
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: "sub", title: "Subtítulo", type: "localeText" }),
        defineField({
          name: "image",
          title: "Imagen",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "ctaPrimaryLabel",
          title: "CTA principal · texto",
          type: "localeString",
        }),
        defineField({
          name: "ctaPrimaryHref",
          title: "CTA principal · destino",
          type: "string",
          description: "Ancla (#contacto) o URL completa.",
        }),
        defineField({
          name: "ctaSecondaryLabel",
          title: "CTA secundario · texto",
          type: "localeString",
        }),
        defineField({
          name: "ctaSecondaryHref",
          title: "CTA secundario · destino",
          type: "string",
        }),
      ],
    }),

    // ---------- About ----------
    defineField({
      name: "about",
      title: "Sobre",
      type: "object",
      group: "about",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "body", title: "Texto", type: "localeText" }),
        defineField({
          name: "bullets",
          title: "Puntos destacados",
          type: "array",
          of: [{ type: "localeString" }],
        }),
        defineField({
          name: "image",
          title: "Imagen",
          type: "image",
          options: { hotspot: true },
        }),
      ],
    }),

    // ---------- Services ----------
    defineField({
      name: "servicesSection",
      title: "Cabecera de servicios",
      type: "object",
      group: "services",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "lead", title: "Lead", type: "localeText" }),
      ],
    }),
    defineField({
      name: "services",
      title: "Servicios",
      type: "array",
      group: "services",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Título",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "localeText",
            }),
            defineField({
              name: "icon",
              title: "Icono (emoji o nombre)",
              type: "string",
            }),
            defineField({
              name: "duration",
              title: "Duración",
              type: "localeString",
            }),
            defineField({
              name: "price",
              title: "Precio",
              type: "localeString",
            }),
          ],
          preview: {
            select: { title: "title.es", subtitle: "price.es" },
          },
        },
      ],
    }),

    // ---------- Team ----------
    defineField({
      name: "teamSection",
      title: "Cabecera de equipo",
      type: "object",
      group: "team",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "lead", title: "Lead", type: "localeText" }),
      ],
    }),
    defineField({
      name: "team",
      title: "Equipo",
      type: "array",
      group: "team",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Nombre",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "role",
              title: "Rol",
              type: "localeString",
            }),
            defineField({
              name: "bio",
              title: "Bio",
              type: "localeText",
            }),
            defineField({
              name: "photo",
              title: "Foto",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role.es", media: "photo" },
          },
        },
      ],
    }),

    // ---------- Testimonials ----------
    defineField({
      name: "testimonialsSection",
      title: "Cabecera de testimonios",
      type: "object",
      group: "testimonials",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
      ],
    }),
    defineField({
      name: "testimonials",
      title: "Testimonios",
      type: "array",
      group: "testimonials",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Cita",
              type: "localeText",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "author",
              title: "Autor/a",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "context",
              title: "Contexto (ej. paciente desde 2022)",
              type: "localeString",
            }),
            defineField({
              name: "photo",
              title: "Foto",
              type: "image",
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: "author", subtitle: "quote.es", media: "photo" },
          },
        },
      ],
    }),

    // ---------- Contact ----------
    defineField({
      name: "contact",
      title: "Contacto",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "lead", title: "Lead", type: "localeText" }),
        defineField({ name: "address", title: "Dirección", type: "string" }),
        defineField({ name: "phone", title: "Teléfono", type: "string" }),
        defineField({ name: "email", title: "Email", type: "string" }),
        defineField({
          name: "hours",
          title: "Horario",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  title: "Día/franja",
                  type: "localeString",
                }),
                defineField({ name: "value", title: "Horas", type: "string" }),
              ],
              preview: {
                select: { title: "label.es", subtitle: "value" },
              },
            },
          ],
        }),
        defineField({
          name: "mapEmbedUrl",
          title: "URL de Google Maps embed",
          type: "url",
        }),
        defineField({
          name: "bookingUrl",
          title: "URL de reservas (Doctoralia, Calendly, etc.)",
          type: "url",
        }),
        defineField({
          name: "social",
          title: "Redes sociales",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "name",
                  title: "Red",
                  type: "string",
                  options: {
                    list: [
                      "Instagram",
                      "Facebook",
                      "TikTok",
                      "LinkedIn",
                      "WhatsApp",
                      "X",
                      "YouTube",
                    ],
                  },
                }),
                defineField({ name: "url", title: "URL", type: "url" }),
              ],
              preview: { select: { title: "name", subtitle: "url" } },
            },
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "businessName.es",
      subtitle: "template",
      media: "thumbnail",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? "(sin nombre)",
        subtitle: subtitle ? `Plantilla: ${subtitle}` : undefined,
        media,
      };
    },
  },
});
