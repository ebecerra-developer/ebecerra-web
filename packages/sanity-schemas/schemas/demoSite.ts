import { defineType, defineField } from "sanity";

export default defineType({
  name: "demoSite",
  title: "Demo de web",
  type: "document",
  groups: [
    { name: "meta", title: "Meta", default: true },
    { name: "brand", title: "Marca" },
    { name: "hero", title: "Portada" },
    { name: "stats", title: "Stats / credenciales" },
    { name: "about", title: "Sobre" },
    { name: "services", title: "Servicios" },
    { name: "objectives", title: "Objetivos" },
    { name: "pricing", title: "Precios" },
    { name: "team", title: "Equipo" },
    { name: "testimonials", title: "Testimonios" },
    { name: "instagram", title: "Instagram" },
    { name: "lifestyle", title: "Lifestyle" },
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
          { title: "Coach (genérico) — deprecado", value: "coach" },
          { title: "Coach editorial (premium)", value: "coach-editorial" },
          { title: "Coach vibrant (marca personal)", value: "coach-vibrant" },
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

    // ---------- Brand overrides ----------
    defineField({
      name: "brand",
      title: "Personalización de marca",
      description:
        "Si rellenas estos campos, la demo usa tus colores/logo. Si los dejas vacíos, usa la paleta y nombre por defecto de la plantilla.",
      type: "object",
      group: "brand",
      fields: [
        defineField({
          name: "logo",
          title: "Logo",
          description:
            "Sustituye al texto del nombre en el nav. SVG o PNG con fondo transparente, recomendado 200×60 px.",
          type: "image",
          options: { hotspot: false },
        }),
        defineField({
          name: "primaryColor",
          title: "Color principal (CTA, acentos)",
          description: "Hex (ej. #5b8c6a). Sustituye al verde sage por defecto.",
          type: "string",
          validation: (Rule) =>
            Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).warning(
              "Usa formato hex: #abc o #aabbcc"
            ),
        }),
        defineField({
          name: "accentColor",
          title: "Color secundario (acentos cálidos)",
          description: "Hex. Sustituye al terracota por defecto.",
          type: "string",
          validation: (Rule) =>
            Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).warning(
              "Usa formato hex: #abc o #aabbcc"
            ),
        }),
        defineField({
          name: "inkColor",
          title: "Color de tinta (footers / fondos oscuros)",
          description:
            "Hex. Sustituye al verde bosque oscuro. Suele ser un tono profundo del primario.",
          type: "string",
          validation: (Rule) =>
            Rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).warning(
              "Usa formato hex: #abc o #aabbcc"
            ),
        }),
        defineField({
          name: "bgTone",
          title: "Tono de fondo",
          type: "string",
          options: {
            list: [
              { title: "Crema cálido (default)", value: "cream" },
              { title: "Off-white neutro", value: "off-white" },
              { title: "Arena suave", value: "sand" },
              { title: "Blanco frío", value: "cool-white" },
            ],
            layout: "radio",
          },
          initialValue: "cream",
        }),
        defineField({
          name: "fontPair",
          title: "Par tipográfico",
          description:
            "Solo aplica a plantillas coach. Define qué par display+body se carga en el cliente.",
          type: "string",
          options: {
            list: [
              { title: "Default (Fraunces + DM Sans)", value: "default" },
              { title: "Coach A — autoridad cálida", value: "coach-a" },
              { title: "Coach B — marca personal moderna", value: "coach-b" },
            ],
            layout: "radio",
          },
          initialValue: "default",
        }),
      ],
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
              name: "image",
              title: "Imagen lifestyle (opcional)",
              description:
                "Foto editorial del servicio. Solo plantillas que la usen.",
              type: "image",
              options: { hotspot: true },
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

    // ---------- Coach: Stats / credenciales ----------
    defineField({
      name: "coachStats",
      title: "Stats / credenciales",
      description:
        "Tira numérica de credenciales (ej. 'Más de 10.000 sesiones'). Solo plantilla coach.",
      type: "array",
      group: "stats",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Valor",
              description: "Ej. '+10.000', '8 años', '500+'",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Etiqueta",
              description: "Ej. 'sesiones acumuladas'",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "value.es", subtitle: "label.es" },
          },
        },
      ],
      validation: (Rule) => Rule.max(5),
    }),

    // ---------- Coach: Objectives ----------
    defineField({
      name: "objectivesSection",
      title: "Cabecera de objetivos",
      type: "object",
      group: "objectives",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "lead", title: "Lead", type: "localeText" }),
      ],
    }),
    defineField({
      name: "objectives",
      title: "Objetivos / para quién",
      description:
        "Cards que segmentan perfiles de cliente (ej. 'perder peso', 'preparar parto'). Solo plantilla coach.",
      type: "array",
      group: "objectives",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icono (emoji)",
              type: "string",
            }),
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
          ],
          preview: {
            select: { title: "title.es", subtitle: "description.es" },
          },
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),

    // ---------- Coach: Pricing ----------
    defineField({
      name: "pricing",
      title: "Precios en bonos",
      description:
        "Tabla pública de precios. Render condicional vía 'enabled'. Solo plantilla coach.",
      type: "object",
      group: "pricing",
      validation: (Rule) =>
        Rule.custom((value: unknown) => {
          if (!value || typeof value !== "object") return true;
          const v = value as {
            enabled?: boolean;
            modalities?: { id?: string }[];
            tiers?: { prices?: { modalityId?: string }[] }[];
          };
          if (!v.enabled) return true;
          const ids = new Set(
            (v.modalities ?? []).map((m) => m?.id).filter(Boolean) as string[]
          );
          if (ids.size === 0) return true;
          for (const tier of v.tiers ?? []) {
            for (const price of tier.prices ?? []) {
              if (price.modalityId && !ids.has(price.modalityId)) {
                return `modalityId "${price.modalityId}" no existe en modalities. IDs válidos: ${Array.from(ids).join(", ")}`;
              }
            }
          }
          return true;
        }),
      fields: [
        defineField({
          name: "enabled",
          title: "Mostrar sección de precios",
          type: "boolean",
          initialValue: false,
        }),
        defineField({ name: "kicker", title: "Kicker", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "lead", title: "Lead", type: "localeText" }),
        defineField({
          name: "modalities",
          title: "Modalidades (columnas)",
          description:
            "Ej. individual / pareja / grupo reducido. Cada id se referencia desde tiers.prices[].",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "id",
                  title: "ID interno",
                  description: "Ej. 'individual'. Usado para enlazar precios.",
                  type: "string",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta visible",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: { select: { title: "label.es", subtitle: "id" } },
            },
          ],
        }),
        defineField({
          name: "tiers",
          title: "Bonos (filas)",
          description:
            "Cada bono define cuántas sesiones incluye y los precios por modalidad.",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "sessions",
                  title: "Nº de sesiones",
                  type: "number",
                  validation: (Rule) => Rule.required().min(1),
                }),
                defineField({
                  name: "label",
                  title: "Etiqueta del bono",
                  description: "Ej. 'Sesión suelta', 'Bono 4', 'Bono 12'",
                  type: "localeString",
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "prices",
                  title: "Precios por modalidad",
                  type: "array",
                  of: [
                    {
                      type: "object",
                      fields: [
                        defineField({
                          name: "modalityId",
                          title: "Modalidad",
                          description:
                            "Debe coincidir con un id de modalidades.",
                          type: "string",
                          validation: (Rule) => Rule.required(),
                        }),
                        defineField({
                          name: "amount",
                          title: "Importe total (€)",
                          type: "number",
                          validation: (Rule) => Rule.required().min(0),
                        }),
                        defineField({
                          name: "perSession",
                          title: "Precio por sesión (€)",
                          description:
                            "Calculado por la editora; mostrado debajo del importe.",
                          type: "number",
                        }),
                      ],
                      preview: {
                        select: {
                          title: "modalityId",
                          subtitle: "amount",
                        },
                        prepare({ title, subtitle }) {
                          return {
                            title: title ?? "(sin modalidad)",
                            subtitle:
                              subtitle != null ? `${subtitle} €` : undefined,
                          };
                        },
                      },
                    },
                  ],
                }),
              ],
              preview: {
                select: { title: "label.es", subtitle: "sessions" },
                prepare({ title, subtitle }) {
                  return {
                    title: title ?? "(sin etiqueta)",
                    subtitle:
                      subtitle != null
                        ? `${subtitle} ${subtitle === 1 ? "sesión" : "sesiones"}`
                        : undefined,
                  };
                },
              },
            },
          ],
        }),
        defineField({
          name: "note",
          title: "Nota al pie",
          description:
            "Ej. 'Pagos por transferencia o Bizum. IVA incluido.'",
          type: "localeText",
        }),
      ],
    }),

    // ---------- Coach: Instagram feed ----------
    defineField({
      name: "instagramFeed",
      title: "Feed de Instagram",
      description:
        "Mosaico de posts (imágenes subidas manualmente, no API real). Render condicional. Solo plantilla coach.",
      type: "object",
      group: "instagram",
      fields: [
        defineField({
          name: "enabled",
          title: "Mostrar feed",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "handle",
          title: "@handle de Instagram",
          description: "Sin @. Ej. 'llaullau'.",
          type: "string",
        }),
        defineField({
          name: "ctaLabel",
          title: "Texto del CTA",
          description: "Ej. 'Sígueme en Instagram'",
          type: "localeString",
        }),
        defineField({
          name: "posts",
          title: "Posts",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "image",
                  title: "Imagen",
                  type: "image",
                  options: { hotspot: true },
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: "caption",
                  title: "Caption",
                  type: "localeString",
                }),
                defineField({
                  name: "postUrl",
                  title: "URL del post original",
                  type: "url",
                }),
              ],
              preview: {
                select: { title: "caption.es", media: "image" },
                prepare({ title, media }) {
                  return {
                    title: title ?? "(sin caption)",
                    media,
                  };
                },
              },
            },
          ],
          validation: (Rule) => Rule.max(12),
        }),
      ],
    }),

    // ---------- Lifestyle gallery ----------
    defineField({
      name: "lifestyleGallery",
      title: "Galería lifestyle",
      description:
        "Tira / mosaico de fotos editoriales sin texto. Render según plantilla.",
      type: "array",
      group: "lifestyle",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "image",
              title: "Imagen",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "localeString",
            }),
          ],
          preview: {
            select: { title: "alt.es", media: "image" },
            prepare({ title, media }) {
              return {
                title: title ?? "(sin alt)",
                media,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.max(12),
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
