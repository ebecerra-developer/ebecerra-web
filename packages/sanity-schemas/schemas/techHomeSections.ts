import { defineType, defineField } from "sanity";

// Singleton con TODO el copy editorial del home de ebecerra.tech.
// Agrupa hero / about / experience / skills / projects / contact como
// objects internos. Un solo documento en Studio para minimizar entropía.
export default defineType({
  name: "techHomeSections",
  title: "Tech · Home (copy)",
  type: "document",
  groups: [
    { name: "hero", title: "Hero" },
    { name: "about", title: "About" },
    { name: "experience", title: "Experience" },
    { name: "skills", title: "Skills" },
    { name: "projects", title: "Projects" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    // ===== HERO ===========================================================
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "hero",
      fields: [
        defineField({ name: "available", title: "Estado disponible", type: "localeString" }),
        defineField({ name: "firstName", title: "Nombre", type: "string" }),
        defineField({ name: "lastName", title: "Apellido", type: "string" }),
        defineField({ name: "tagline", title: "Tagline", type: "localeText" }),
        defineField({ name: "ctaContact", title: "CTA contacto", type: "localeString" }),
        defineField({ name: "ctaProjects", title: "CTA proyectos", type: "localeString" }),
        defineField({
          name: "terminal",
          title: "Terminal interactivo",
          type: "object",
          description: "Comandos, outputs y mensajes del terminal del hero.",
          fields: [
            defineField({ name: "title", title: "Título de la ventana", type: "string" }),
            defineField({ name: "placeholder", title: "Placeholder input", type: "localeString" }),
            defineField({ name: "cdBlocked", title: "Bloqueo · cd", type: "localeString" }),
            defineField({ name: "sudoBlocked", title: "Bloqueo · sudo", type: "localeString" }),
            defineField({ name: "rmBlocked", title: "Bloqueo · rm", type: "localeString" }),
            defineField({
              name: "notFound",
              title: "Comando no encontrado",
              description: "Usa {cmd} como placeholder del comando.",
              type: "localeString",
            }),
            defineField({
              name: "lines",
              title: "Líneas iniciales (output)",
              type: "object",
              fields: [
                defineField({ name: "whoamiOut", title: "whoami →", type: "localeString" }),
                defineField({ name: "roleOut", title: "cat role.txt →", type: "localeString" }),
                defineField({ name: "skillsOut", title: "./skills →", type: "localeString" }),
                defineField({ name: "statusOut", title: "echo $status →", type: "localeString" }),
              ],
            }),
            defineField({
              name: "commands",
              title: "Comandos disponibles",
              type: "object",
              fields: [
                defineField({ name: "help", title: "help", type: "localeText" }),
                defineField({ name: "whoami", title: "whoami", type: "localeString" }),
                defineField({ name: "role", title: "cat role.txt", type: "localeString" }),
                defineField({ name: "skills", title: "./skills --top", type: "localeString" }),
                defineField({ name: "status", title: "echo $status", type: "localeString" }),
                defineField({ name: "pwd", title: "pwd", type: "localeString" }),
                defineField({ name: "ls", title: "ls", type: "localeString" }),
                defineField({ name: "exit", title: "exit", type: "localeString" }),
                defineField({ name: "gitBlame", title: "git blame", type: "localeString" }),
              ],
            }),
          ],
        }),
      ],
    }),
    // ===== ABOUT ==========================================================
    defineField({
      name: "about",
      title: "About",
      type: "object",
      group: "about",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({
          name: "bio1",
          title: "Bio · párrafo 1",
          type: "localeText",
          description: "Soporta HTML inline (<strong>, <em>) en el render.",
        }),
        defineField({ name: "bio2", title: "Bio · párrafo 2", type: "localeText" }),
        defineField({ name: "bio3", title: "Bio · párrafo 3", type: "localeText" }),
      ],
    }),
    // ===== EXPERIENCE chrome =============================================
    defineField({
      name: "experience",
      title: "Experience (chrome)",
      type: "object",
      group: "experience",
      description:
        "Cabecera de la sección. Los items vienen de los documentos 'experience'.",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
      ],
    }),
    // ===== SKILLS chrome =================================================
    defineField({
      name: "skills",
      title: "Skills (chrome)",
      type: "object",
      group: "skills",
      description:
        "Cabecera de la sección. Los items vienen de los documentos 'skill' y 'techTag'.",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
      ],
    }),
    // ===== PROJECTS chrome ===============================================
    defineField({
      name: "projects",
      title: "Projects (chrome)",
      type: "object",
      group: "projects",
      description:
        "Cabecera de la sección. Los items vienen de los documentos 'project'.",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
      ],
    }),
    // ===== CONTACT chrome ================================================
    defineField({
      name: "contact",
      title: "Contact (chrome)",
      type: "object",
      group: "contact",
      description:
        "Cabecera del bloque de contacto. El formulario en sí vive en techContactFormSettings.",
      fields: [
        defineField({ name: "eyebrow", title: "Eyebrow", type: "localeString" }),
        defineField({ name: "title", title: "Título", type: "localeString" }),
        defineField({ name: "description", title: "Descripción", type: "localeText" }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Tech · Home (copy)" }) },
});
