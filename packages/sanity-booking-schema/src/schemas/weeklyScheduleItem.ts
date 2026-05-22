import { defineType, defineField } from "sanity";

const WEEKDAYS = [
  { title: "Lunes", value: 1 },
  { title: "Martes", value: 2 },
  { title: "Miércoles", value: 3 },
  { title: "Jueves", value: 4 },
  { title: "Viernes", value: 5 },
  { title: "Sábado", value: 6 },
  { title: "Domingo", value: 0 },
];

export default defineType({
  name: "weeklyScheduleItem",
  title: "Tramo semanal",
  type: "object",
  fields: [
    defineField({
      name: "weekday",
      title: "Día de la semana",
      type: "number",
      options: { list: WEEKDAYS, layout: "dropdown" },
      validation: (Rule) => Rule.required().min(0).max(6),
    }),
    defineField({
      name: "startTime",
      title: "Hora inicio (HH:MM)",
      type: "string",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "HH:MM 24h",
          invert: false,
        }),
    }),
    defineField({
      name: "endTime",
      title: "Hora fin (HH:MM)",
      type: "string",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "HH:MM 24h",
          invert: false,
        }),
    }),
  ],
  preview: {
    select: { weekday: "weekday", startTime: "startTime", endTime: "endTime" },
    prepare: ({ weekday, startTime, endTime }) => {
      const dayLabel =
        WEEKDAYS.find((d) => d.value === weekday)?.title ?? "Día";
      return {
        title: `${dayLabel} · ${startTime} → ${endTime}`,
      };
    },
  },
});
