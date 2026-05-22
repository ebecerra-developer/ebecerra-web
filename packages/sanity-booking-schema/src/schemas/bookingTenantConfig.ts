import { defineType, defineField } from "sanity";

/**
 * Configuración de un tenant con sistema de reservas.
 *
 * Cardinalidad:
 *  - En workspace compartido (apps/es Sanity): un documento por cliente.
 *  - En workspace de cliente externo (futuro): un único documento (singleton).
 *
 * Al publicar dispara webhook a bookings.ebecerra.es/api/saas/bookings-sync
 * y se cachea en Supabase central (booking_tenants + booking_weekly_schedules
 * + booking_availability_overrides).
 */
export default defineType({
  name: "bookingTenantConfig",
  title: "Reservas · Configuración del tenant",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug del tenant",
      description:
        "Identificador URL-friendly, ej. 'beemovement'. Aparece en bookings.ebecerra.es/<slug>.",
      type: "slug",
      options: { source: "name", maxLength: 60 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "name",
      title: "Nombre del negocio",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "timezone",
      title: "Zona horaria",
      description: "Ej. Europe/Madrid. Todos los slots se renderizan aquí.",
      type: "string",
      initialValue: "Europe/Madrid",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "currency",
      title: "Moneda (ISO 4217)",
      type: "string",
      initialValue: "EUR",
      validation: (Rule) => Rule.required().length(3),
    }),
    defineField({
      name: "defaultLocale",
      title: "Idioma por defecto",
      type: "string",
      options: {
        list: [
          { title: "Español", value: "es" },
          { title: "English", value: "en" },
        ],
        layout: "radio",
      },
      initialValue: "es",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "requiresApproval",
      title: "Requiere aprobación manual",
      description:
        "Por defecto las reservas se auto-confirman al hacer click en el email. Activa esto si quieres aprobarlas manualmente desde /admin.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "cancellationPolicy",
      title: "Política de cancelación",
      description:
        "Texto que se muestra al cliente al reservar y en el email de confirmación.",
      type: "localeText",
    }),
    defineField({
      name: "contactEmail",
      title: "Email de contacto del negocio",
      description: "Destinatario de avisos internos (nuevas reservas, cancelaciones).",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "brandingLogoUrl",
      title: "Logo (URL)",
      type: "url",
    }),
    defineField({
      name: "brandingColorPrimary",
      title: "Color primario (hex)",
      description: "Ej. #047857. Se usa en emails y, si embebes el widget, como acento.",
      type: "string",
    }),
    defineField({
      name: "allowedOrigins",
      title: "Orígenes permitidos (CORS)",
      description:
        "URLs desde las que se puede embeber el widget, ej. https://beemovement.es. Una por línea.",
      type: "array",
      of: [{ type: "url" }],
    }),
    defineField({
      name: "reminderHoursBefore",
      title: "Horas antes del recordatorio",
      type: "number",
      initialValue: 24,
      validation: (Rule) => Rule.required().min(0).max(168),
    }),
    defineField({
      name: "weeklySchedule",
      title: "Horario semanal",
      description:
        "Tramos recurrentes. Varios tramos por día permitidos (mañana + tarde = 2 filas).",
      type: "array",
      of: [{ type: "weeklyScheduleItem" }],
    }),
    defineField({
      name: "availabilityOverrides",
      title: "Excepciones (vacaciones, festivos, aperturas extra)",
      type: "array",
      of: [{ type: "availabilityOverrideItem" }],
    }),
  ],
  preview: {
    select: { name: "name", slug: "slug.current" },
    prepare: ({ name, slug }) => ({
      title: name ?? "Sin nombre",
      subtitle: slug ? `Reservas · ${slug}` : "Reservas · (sin slug)",
    }),
  },
});
