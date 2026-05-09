import { defineConfig } from "sanity";
import { structureTool, type StructureResolver } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { languageFilter } from "@sanity/language-filter";
// TODO: re-añadir plugin Unsplash cuando publiquen versión compatible con
// sanity v5. El último (3.1.0) sólo soporta sanity ^3 || ^4. Mientras tanto,
// los editores pueden subir imágenes manualmente al asset library de Sanity.
// import { unsplashImageAsset } from "sanity-plugin-asset-source-unsplash";
import { schemaTypes, SINGLETON_TYPES } from "@ebecerra/sanity-schemas";

const singletonSet = new Set<string>(SINGLETON_TYPES);

const LOCALIZED_DOCUMENT_TYPES = [
  "experience",
  "skill",
  "techTag",
  "project",
  "profile",
  "service",
  "processStep",
  "caseStudy",
  "heroSection",
  "siteSettings",
  "serviceSectionMeta",
  "processSectionMeta",
  "casesSectionMeta",
  "contactSectionMeta",
  "faqPage",
  "faqItem",
  "legalPage",
  "demoSite",
];

const SINGLETON_DISABLED_ACTIONS = new Set([
  "create",
  "delete",
  "duplicate",
  "unpublish",
]);

// Estructura personalizada: singletons con documentId fijo agrupados,
// colecciones por tipo.
const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Home")
        .child(
          S.list()
            .title("Home")
            .items([
              S.listItem()
                .title("Hero")
                .id("heroSection")
                .child(
                  S.document().schemaType("heroSection").documentId("8d0cdc27-e77a-413f-97b3-295cffeeef0d")
                ),
              S.listItem()
                .title("Sección · Servicios")
                .id("serviceSectionMeta")
                .child(
                  S.document()
                    .schemaType("serviceSectionMeta")
                    .documentId("a6675cf9-f20f-4741-82dc-f4f6f2504264")
                ),
              S.listItem()
                .title("Sección · Proceso")
                .id("processSectionMeta")
                .child(
                  S.document()
                    .schemaType("processSectionMeta")
                    .documentId("5e6bf4ca-36ba-4537-b015-b6cb7bf76fcc")
                ),
              S.listItem()
                .title("Sección · Casos")
                .id("casesSectionMeta")
                .child(
                  S.document()
                    .schemaType("casesSectionMeta")
                    .documentId("3fbbc4f8-48c6-4adc-9ae8-15123db6a005")
                ),
              S.listItem()
                .title("Sección · Contacto")
                .id("contactSectionMeta")
                .child(
                  S.document()
                    .schemaType("contactSectionMeta")
                    .documentId("b2746aef-0e12-44a1-83b3-9ffe84551f32")
                ),
            ])
        ),
      S.listItem()
        .title("Ajustes")
        .child(
          S.list()
            .title("Ajustes")
            .items([
              S.listItem()
                .title("Ajustes del sitio")
                .id("siteSettings")
                .child(
                  S.document().schemaType("siteSettings").documentId("de40d1fb-51ab-46d3-83c6-ffebefe05016")
                ),
              // Perfil existe con UUID legacy — se resuelve por filtro hasta
              // migrar a documentId "profile". Con document.actions bloqueando
              // create/duplicate sigue siendo singleton de facto.
              S.listItem()
                .title("Perfil")
                .id("profile-singleton")
                .child(
                  S.documentTypeList("profile")
                    .title("Perfil")
                    .filter('_type == "profile"')
                ),
              S.listItem()
                .title("Página FAQ (meta)")
                .id("faqPage")
                .child(
                  S.document().schemaType("faqPage").documentId("2fccf962-b05c-4377-a421-efa1cca17b78")
                ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Servicios")
        .schemaType("service")
        .child(S.documentTypeList("service").title("Servicios")),
      S.listItem()
        .title("Pasos del proceso")
        .schemaType("processStep")
        .child(S.documentTypeList("processStep").title("Pasos del proceso")),
      S.listItem()
        .title("Casos")
        .schemaType("caseStudy")
        .child(S.documentTypeList("caseStudy").title("Casos")),
      S.listItem()
        .title("FAQ — Preguntas")
        .schemaType("faqItem")
        .child(
          S.documentTypeList("faqItem")
            .title("FAQ — Preguntas")
            .defaultOrdering([{ field: "order", direction: "asc" }])
        ),
      S.listItem()
        .title("Páginas legales")
        .schemaType("legalPage")
        .child(S.documentTypeList("legalPage").title("Páginas legales")),
      S.divider(),
      S.listItem()
        .title("Demos de webs")
        .schemaType("demoSite")
        .child(
          S.documentTypeList("demoSite")
            .title("Demos de webs")
            .defaultOrdering([{ field: "galleryOrder", direction: "asc" }])
        ),
      S.divider(),
      S.listItem()
        .title("Experiencia")
        .schemaType("experience")
        .child(S.documentTypeList("experience").title("Experiencia")),
      S.listItem()
        .title("Skills")
        .schemaType("skill")
        .child(S.documentTypeList("skill").title("Skills")),
      S.listItem()
        .title("Tech tags")
        .schemaType("techTag")
        .child(S.documentTypeList("techTag").title("Tech tags")),
      S.listItem()
        .title("Proyectos")
        .schemaType("project")
        .child(S.documentTypeList("project").title("Proyectos")),
    ]);

export default defineConfig({
  name: "ebecerra-web",
  title: "ebecerra.es",
  projectId: "gdtxcn4l",
  dataset: "production",
  basePath: "/studio",
  plugins: [
    structureTool({ structure }),
    visionTool(),
    languageFilter({
      supportedLanguages: [
        { id: "es", title: "Español" },
        { id: "en", title: "English" },
      ],
      defaultLanguages: ["es"],
      documentTypes: LOCALIZED_DOCUMENT_TYPES,
      filterField: (enclosingType, member, selectedLanguageIds) =>
        !enclosingType.name.startsWith("locale") ||
        ("name" in member && selectedLanguageIds.includes(member.name)),
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  // Enforcement singleton: bloquear create/delete/duplicate/unpublish en los
  // tipos declarados como singleton. Una sola lista en un punto.
  document: {
    actions: (input, context) => {
      if (singletonSet.has(context.schemaType)) {
        return input.filter(
          ({ action }) => !!action && !SINGLETON_DISABLED_ACTIONS.has(action)
        );
      }
      return input;
    },
    // Prevenir crear nuevos docs de tipos singleton desde el "New document"
    // global (fuera del structure).
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === "global") {
        return prev.filter((template) => !singletonSet.has(template.templateId));
      }
      return prev;
    },
  },
});
