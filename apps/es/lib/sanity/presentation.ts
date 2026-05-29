import {
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

// Origin por defecto donde abre el iframe de Presentation. En dev usamos
// localhost; en producción, ebecerra.es. Los demás fronts (ebecerra.tech,
// demos.ebecerra.es) los alcanza el iframe siguiendo hrefs absolutos
// devueltos por defineLocations — cada front es responsable de implementar
// /api/draft-mode/enable bajo su propio origin para que el Studio reactive
// draft mode al navegar.
const previewOrigin =
  process.env.NEXT_PUBLIC_SANITY_PREVIEW_ORIGIN_ES ||
  (process.env.NODE_ENV === "production"
    ? "https://ebecerra.es"
    : "http://localhost:3000");

const techOrigin =
  process.env.NEXT_PUBLIC_SANITY_PREVIEW_ORIGIN_TECH ||
  (process.env.NODE_ENV === "production"
    ? "https://ebecerra.tech"
    : "http://localhost:3001");

const demosOrigin =
  process.env.NEXT_PUBLIC_SANITY_PREVIEW_ORIGIN_DEMOS ||
  (process.env.NODE_ENV === "production"
    ? "https://demos.ebecerra.es"
    : "http://localhost:3002");

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    // ───── ebecerra.es (apps/es) ─────
    heroSection: defineLocations({
      message: "Aparece en la home.",
      locations: [
        { title: "Home", href: `${previewOrigin}/` },
        { title: "Home (EN)", href: `${previewOrigin}/en/` },
      ],
    }),
    servicesPricing: defineLocations({
      message: "Sección 01 · Servicios.",
      locations: [
        { title: "Home — Servicios", href: `${previewOrigin}/#servicios` },
      ],
    }),
    serviceSectionMeta: defineLocations({
      locations: [
        { title: "Home — Servicios (meta)", href: `${previewOrigin}/#servicios` },
      ],
    }),
    processSectionMeta: defineLocations({
      locations: [
        { title: "Home — Proceso", href: `${previewOrigin}/#proceso` },
      ],
    }),
    casesSectionMeta: defineLocations({
      locations: [
        { title: "Home — Casos", href: `${previewOrigin}/#casos` },
      ],
    }),
    contactSectionMeta: defineLocations({
      locations: [
        { title: "Home — Contacto", href: `${previewOrigin}/#contacto` },
      ],
    }),
    siteSettings: defineLocations({
      message: "Aplica a todo el sitio.",
      locations: [{ title: "Home", href: `${previewOrigin}/` }],
    }),
    profile: defineLocations({
      message: "Aparece en la home y en la sección Sobre mí.",
      locations: [
        { title: "Home — Sobre mí", href: `${previewOrigin}/#sobre-mi` },
      ],
    }),
    caseStudy: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Caso",
            href: `${previewOrigin}/casos/${doc?.slug}`,
          },
          { title: "Home — Casos", href: `${previewOrigin}/#casos` },
        ],
      }),
    }),
    processStep: defineLocations({
      locations: [
        { title: "Home — Proceso", href: `${previewOrigin}/#proceso` },
      ],
    }),
    faqPage: defineLocations({
      locations: [{ title: "FAQ", href: `${previewOrigin}/faq` }],
    }),
    faqItem: defineLocations({
      select: { question: "question" },
      resolve: () => ({
        locations: [{ title: "FAQ", href: `${previewOrigin}/faq` }],
      }),
    }),
    examplesPage: defineLocations({
      locations: [{ title: "Ejemplos", href: `${previewOrigin}/ejemplos` }],
    }),
    legalPage: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Legal",
            href: `${previewOrigin}/${doc?.slug}`,
          },
        ],
      }),
    }),
    post: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Post",
            href: `${previewOrigin}/blog/${doc?.slug}`,
          },
          { title: "Blog", href: `${previewOrigin}/blog` },
        ],
      }),
    }),
    author: defineLocations({
      locations: [{ title: "Blog", href: `${previewOrigin}/blog` }],
    }),
    blogCategory: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: `Categoría · ${doc?.title || ""}`,
            href: `${previewOrigin}/blog/categoria/${doc?.slug}`,
          },
          { title: "Blog", href: `${previewOrigin}/blog` },
        ],
      }),
    }),
    blogTag: defineLocations({
      locations: [{ title: "Blog", href: `${previewOrigin}/blog` }],
    }),

    // ───── ebecerra.tech (apps/tech) ─────
    project: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Proyecto",
            href: `${techOrigin}/#proyectos`,
          },
        ],
      }),
    }),
    experience: defineLocations({
      locations: [
        { title: "Experiencia", href: `${techOrigin}/#experiencia` },
      ],
    }),
    skill: defineLocations({
      locations: [{ title: "Skills", href: `${techOrigin}/#skills` }],
    }),
    techTag: defineLocations({
      locations: [{ title: "Tech", href: `${techOrigin}/` }],
    }),

    // ───── demos.ebecerra.es (apps/demos) ─────
    demoSite: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Demo",
            href: `${demosOrigin}/es/${doc?.slug}`,
          },
          {
            title: `${doc?.title || "Demo"} (EN)`,
            href: `${demosOrigin}/en/${doc?.slug}`,
          },
        ],
      }),
    }),
  },
};

export { previewOrigin, techOrigin, demosOrigin };
