import { defineType, defineField } from "sanity";

export default defineType({
  name: "chatbotBusinessInfo",
  title: "Datos del negocio",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "name",
      title: "Nombre comercial",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción corta",
      description: "Una frase que resuma a qué se dedica el negocio.",
      type: "localeText",
    }),
    defineField({
      name: "address",
      title: "Dirección (opcional)",
      type: "string",
    }),
    defineField({
      name: "hours",
      title: "Horario (opcional)",
      type: "string",
      description: "Ej: 'L-V de 9 a 19h, sábados con cita previa'",
    }),
    defineField({
      name: "services",
      title: "Servicios principales",
      type: "localeText",
      description: "Lista de servicios que ofrece. El bot los usa para responder preguntas frecuentes.",
    }),
    defineField({
      name: "contactWhatsapp",
      title: "WhatsApp de contacto (opcional)",
      type: "string",
      description: "Para que el bot redirija a humano cuando la duda lo requiera.",
    }),
    defineField({
      name: "contactEmail",
      title: "Email de contacto (opcional)",
      type: "string",
    }),
  ],
});
