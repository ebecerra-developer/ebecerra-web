import { defineType, defineField } from "sanity";

export default defineType({
  name: "bookingService",
  title: "Reservas · Servicio",
  type: "document",
  fields: [
    defineField({
      name: "tenant",
      title: "Tenant",
      description: "Negocio al que pertenece este servicio.",
      type: "reference",
      to: [{ type: "bookingTenantConfig" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Nombre del servicio",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "localeText",
    }),
    defineField({
      name: "durationMin",
      title: "Duración (minutos)",
      type: "number",
      validation: (Rule) => Rule.required().min(5).max(480),
    }),
    defineField({
      name: "bufferBeforeMin",
      title: "Buffer antes (minutos)",
      description: "Tiempo bloqueado antes de la cita (preparación).",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(120),
    }),
    defineField({
      name: "bufferAfterMin",
      title: "Buffer después (minutos)",
      description: "Tiempo bloqueado después de la cita (limpieza, descanso).",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(120),
    }),
    defineField({
      name: "priceCents",
      title: "Precio (céntimos)",
      description:
        "Ej. 5000 = 50,00 €. Vacío = 'consultar' (no se muestra precio público).",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "color",
      title: "Color (hex)",
      description: "Para diferenciarlo visualmente en el calendario.",
      type: "string",
    }),
    defineField({
      name: "active",
      title: "Activo",
      description: "Si está desactivado no aparece en el widget público.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Orden",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Orden manual",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      name: "name.es",
      duration: "durationMin",
      tenant: "tenant.name",
      active: "active",
    },
    prepare: ({ name, duration, tenant, active }) => ({
      title: name ?? "Servicio sin nombre",
      subtitle: `${tenant ?? "?"} · ${duration ?? "?"} min${active === false ? " · INACTIVO" : ""}`,
    }),
  },
});
