import { defineType, defineField } from "sanity";

export default defineType({
  name: "availabilityOverrideItem",
  title: "Excepción de disponibilidad",
  type: "object",
  fields: [
    defineField({
      name: "overrideDate",
      title: "Fecha",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kind",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Cerrado", value: "closed" },
          { title: "Apertura extra", value: "extra" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Hora inicio (HH:MM) — opcional para 'Cerrado' día entero",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "HH:MM 24h",
          invert: false,
        }),
    }),
    defineField({
      name: "endTime",
      title: "Hora fin (HH:MM) — opcional para 'Cerrado' día entero",
      type: "string",
      validation: (Rule) =>
        Rule.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "HH:MM 24h",
          invert: false,
        }),
    }),
    defineField({
      name: "reason",
      title: "Motivo (interno)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      overrideDate: "overrideDate",
      kind: "kind",
      startTime: "startTime",
      endTime: "endTime",
      reason: "reason",
    },
    prepare: ({ overrideDate, kind, startTime, endTime, reason }) => {
      const kindLabel = kind === "closed" ? "Cerrado" : "Extra";
      const range = startTime && endTime ? ` ${startTime}–${endTime}` : "";
      return {
        title: `${overrideDate} · ${kindLabel}${range}`,
        subtitle: reason ?? "",
      };
    },
  },
});
