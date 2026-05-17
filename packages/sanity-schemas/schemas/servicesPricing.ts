import { defineType, defineField } from "sanity";

/**
 * Singleton que modela la sección de Servicios y precios en apps/es.
 *
 * Estructura:
 *   - Header de sección (kicker / title / lead)
 *   - Selector de caminos (pathSelectorLabel)
 *   - paths: array de 2 caminos (Contrato / Pago único). Cada camino contiene 3 tiers.
 *   - cancellationClause: callout (solo visible cuando el path activo coincide
 *     con showOnPathId).
 *   - addOns: módulos contratables aparte.
 *   - migrationFootnote: nota al pie común a ambos caminos.
 */
export default defineType({
  name: "servicesPricing",
  title: "Sección Servicios y precios",
  type: "document",
  fields: [
    defineField({
      name: "kicker",
      title: "Kicker (línea superior)",
      type: "localeString",
    }),
    defineField({
      name: "title",
      title: "Título de la sección",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lead",
      title: "Subtítulo / intro",
      type: "localeText",
    }),
    defineField({
      name: "pathSelectorLabel",
      title: "Etiqueta del selector de caminos",
      type: "localeString",
      description: "Texto pequeño sobre las pills. Ej: '¿Cómo prefieres pagarlo?'",
    }),
    defineField({
      name: "paths",
      title: "Caminos de contratación",
      type: "array",
      validation: (Rule) => Rule.min(1).max(4),
      of: [
        {
          type: "object",
          name: "pricingPath",
          title: "Camino",
          fields: [
            defineField({
              name: "id",
              title: "ID (slug interno)",
              type: "string",
              description:
                "Identificador estable. Recomendado: 'contract' o 'oneTime'. Se usa para mostrar la cláusula de rescisión y como key React.",
              validation: (Rule) =>
                Rule.required().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "label",
              title: "Etiqueta del pill",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "tagline",
              title: "Subtítulo del camino (opcional)",
              type: "localeString",
              description:
                "Aparece sutil debajo de las pills al activar el camino. Ej: 'Recomendado para entrar al mercado'.",
            }),
            defineField({
              name: "isDefault",
              title: "Activo por defecto",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "tiers",
              title: "Tiers",
              type: "array",
              validation: (Rule) => Rule.min(1).max(5),
              of: [
                {
                  type: "object",
                  name: "pricingTier",
                  title: "Tier",
                  fields: [
                    defineField({
                      name: "id",
                      title: "ID (slug interno)",
                      type: "string",
                      description:
                        "Identificador estable del tier. Ej: 'esencial', 'profesional', 'avanzado'.",
                      validation: (Rule) =>
                        Rule.required().regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
                          name: "slug",
                          invert: false,
                        }),
                    }),
                    defineField({
                      name: "name",
                      title: "Nombre del tier",
                      type: "localeString",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "priceMain",
                      title: "Precio principal (display)",
                      type: "string",
                      description:
                        "Texto del precio. Ej: '399 €', '900 €', '1.500 €'. Se renderiza tal cual.",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "priceSecondary",
                      title: "Precio secundario (opcional)",
                      type: "localeString",
                      description:
                        "Segunda línea junto al precio. Ej: '+ 49 €/mes'. Vacío si no aplica (pago único).",
                    }),
                    defineField({
                      name: "conditions",
                      title: "Condiciones (subtext)",
                      type: "localeString",
                      description:
                        "Línea pequeña bajo el precio. Ej: 'Permanencia mínima: 12 meses' o 'Incluye 3 meses de soporte post-entrega'.",
                    }),
                    defineField({
                      name: "features",
                      title: "Features (lista con flecha →)",
                      type: "array",
                      of: [
                        {
                          type: "object",
                          name: "tierFeature",
                          fields: [
                            defineField({
                              name: "text",
                              title: "Texto",
                              type: "localeString",
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: "highlight",
                              title: "Destacar visualmente",
                              type: "boolean",
                              description:
                                "Útil para resaltar la línea de migración incluida.",
                              initialValue: false,
                            }),
                          ],
                          preview: {
                            select: {
                              title: "text.es",
                              subtitle: "highlight",
                            },
                            prepare: ({ title, subtitle }) => ({
                              title: title || "(sin texto)",
                              subtitle: subtitle ? "★ destacado" : undefined,
                            }),
                          },
                        },
                      ],
                    }),
                    defineField({
                      name: "highlighted",
                      title: "Card destacada (borde más pronunciado)",
                      type: "boolean",
                      initialValue: false,
                    }),
                    defineField({
                      name: "badge",
                      title: "Badge (texto en esquina, opcional)",
                      type: "localeString",
                      description:
                        "Solo si highlighted = true. Ej: 'más contratado'.",
                    }),
                    defineField({
                      name: "ctaLabel",
                      title: "Etiqueta del CTA (opcional)",
                      type: "localeString",
                      description:
                        "Si vacío, se usa el CTA por defecto de la sección.",
                    }),
                    defineField({
                      name: "ctaHref",
                      title: "Destino del CTA (opcional)",
                      type: "string",
                      description: "Si vacío, apunta a #contacto.",
                    }),
                  ],
                  preview: {
                    select: {
                      title: "name.es",
                      subtitle: "priceMain",
                      highlighted: "highlighted",
                    },
                    prepare: ({ title, subtitle, highlighted }) => ({
                      title: title || "(sin nombre)",
                      subtitle: highlighted ? `★ ${subtitle ?? ""}` : subtitle,
                    }),
                  },
                },
              ],
            }),
          ],
          preview: {
            select: {
              title: "label.es",
              subtitle: "id",
              isDefault: "isDefault",
            },
            prepare: ({ title, subtitle, isDefault }) => ({
              title: title || "(sin etiqueta)",
              subtitle: isDefault ? `${subtitle} · por defecto` : subtitle,
            }),
          },
        },
      ],
    }),
    defineField({
      name: "cancellationClause",
      title: "Cláusula de rescisión (callout)",
      type: "object",
      description:
        "Callout sutil que solo se muestra cuando el camino activo coincide con 'Mostrar en path id'.",
      fields: [
        defineField({
          name: "showOnPathId",
          title: "Mostrar en path id",
          type: "string",
          description: "Path id donde aparece la cláusula. Vacío = no se muestra.",
        }),
        defineField({
          name: "label",
          title: "Etiqueta corta (opcional)",
          type: "localeString",
          description: "Mini-titular del callout. Ej: 'Cláusula de rescisión'.",
        }),
        defineField({
          name: "body",
          title: "Texto del callout",
          type: "localeText",
        }),
      ],
    }),
    defineField({
      name: "addOnsSectionTitle",
      title: "Título de la sección de add-ons",
      type: "localeString",
    }),
    defineField({
      name: "addOnsSectionLead",
      title: "Lead de add-ons (opcional)",
      type: "localeString",
    }),
    defineField({
      name: "addOns",
      title: "Add-ons",
      type: "array",
      of: [
        {
          type: "object",
          name: "addOn",
          fields: [
            defineField({
              name: "title",
              title: "Título",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "price",
              title: "Precio (display)",
              type: "localeString",
              description: "Ej: '199 € setup + 29 €/mes'.",
            }),
            defineField({
              name: "note",
              title: "Nota / descripción corta",
              type: "localeString",
            }),
          ],
          preview: {
            select: { title: "title.es", subtitle: "price.es" },
          },
        },
      ],
    }),
    defineField({
      name: "migrationFootnote",
      title: "Footnote de migración",
      type: "localeText",
      description:
        "Texto pequeño al pie con * — info de migración de contenido adicional.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Sección Servicios y precios" }),
  },
});
