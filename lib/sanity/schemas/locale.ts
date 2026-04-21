import { defineType, defineField } from "sanity";

type Language = { id: string; title: string; isDefault?: boolean };

const supportedLanguages: Language[] = [
  { id: "es", title: "Español", isDefault: true },
  { id: "en", title: "English" },
];

const localeStringFields = supportedLanguages.map((lang) =>
  defineField({
    name: lang.id,
    title: lang.title,
    type: "string",
    validation: lang.isDefault ? (Rule) => Rule.required() : undefined,
  })
);

const localeTextFields = supportedLanguages.map((lang) =>
  defineField({
    name: lang.id,
    title: lang.title,
    type: "text",
    validation: lang.isDefault ? (Rule) => Rule.required() : undefined,
  })
);

const localePortableTextFields = supportedLanguages.map((lang) =>
  defineField({
    name: lang.id,
    title: lang.title,
    type: "array",
    of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    validation: lang.isDefault ? (Rule) => Rule.required() : undefined,
  })
);

export const localeString = defineType({
  name: "localeString",
  title: "Texto localizado (corto)",
  type: "object",
  fields: localeStringFields,
});

export const localeText = defineType({
  name: "localeText",
  title: "Texto localizado (largo)",
  type: "object",
  fields: localeTextFields,
});

export const localePortableText = defineType({
  name: "localePortableText",
  title: "Rich text localizado",
  type: "object",
  fields: localePortableTextFields,
});
