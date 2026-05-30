import {
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

// El Studio vive en apps/es y sirve a tres fronts.
//
// Para los docTypes de apps/es (ebecerra.es), el Studio y el front comparten
// origen → hrefs relativos, el Presentation Tool resuelve contra el dominio
// donde corre el Studio. Funciona en vercel.app, branch previews y dominio
// custom sin tocar env vars.
//
// Para apps/tech (ebecerra.tech) y apps/demos (demos.ebecerra.es), el front
// vive en otro origin → hrefs absolutos. Los origins pueden overridearse
// con env vars (útil cuando esos fronts cambien de dominio).

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
    // ───── ebecerra.es (apps/es) — hrefs relativos ─────
    heroSection: defineLocations({
      message: "Aparece en la home.",
      locations: [
        { title: "Home", href: "/" },
        { title: "Home (EN)", href: "/en/" },
      ],
    }),
    servicesPricing: defineLocations({
      message: "Sección 01 · Servicios.",
      locations: [{ title: "Home — Servicios", href: "/#servicios" }],
    }),
    capabilitiesSection: defineLocations({
      message: "Sección 03 · Capacidades.",
      locations: [{ title: "Home — Capacidades", href: "/#capacidades" }],
    }),
    contactFormSettings: defineLocations({
      message: "Wizard del formulario de contacto.",
      locations: [{ title: "Home — Contacto", href: "/#contacto" }],
    }),
    contactFormStep: defineLocations({
      locations: [{ title: "Home — Contacto", href: "/#contacto" }],
    }),
    serviceSectionMeta: defineLocations({
      locations: [{ title: "Home — Servicios (meta)", href: "/#servicios" }],
    }),
    processSectionMeta: defineLocations({
      locations: [{ title: "Home — Proceso", href: "/#proceso" }],
    }),
    casesSectionMeta: defineLocations({
      locations: [{ title: "Home — Casos", href: "/#casos" }],
    }),
    contactSectionMeta: defineLocations({
      locations: [{ title: "Home — Contacto", href: "/#contacto" }],
    }),
    siteSettings: defineLocations({
      message: "Aplica a todo el sitio.",
      locations: [{ title: "Home", href: "/" }],
    }),
    profile: defineLocations({
      message: "Aparece en la home y en la sección Sobre mí.",
      locations: [{ title: "Home — Sobre mí", href: "/#sobre-mi" }],
    }),
    caseStudy: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Caso",
            href: `/casos/${doc?.slug}`,
          },
          { title: "Home — Casos", href: "/#casos" },
        ],
      }),
    }),
    processStep: defineLocations({
      locations: [{ title: "Home — Proceso", href: "/#proceso" }],
    }),
    faqPage: defineLocations({
      locations: [{ title: "FAQ", href: "/faq" }],
    }),
    faqItem: defineLocations({
      select: { question: "question" },
      resolve: () => ({
        locations: [{ title: "FAQ", href: "/faq" }],
      }),
    }),
    examplesPage: defineLocations({
      locations: [{ title: "Ejemplos", href: "/ejemplos" }],
    }),
    legalPage: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: (doc?.title as string) || "Legal",
            href: `/${doc?.slug}`,
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
            href: `/blog/${doc?.slug}`,
          },
          { title: "Blog", href: "/blog" },
        ],
      }),
    }),
    author: defineLocations({
      locations: [{ title: "Blog", href: "/blog" }],
    }),
    blogCategory: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: `Categoría · ${doc?.title || ""}`,
            href: `/blog/categoria/${doc?.slug}`,
          },
          { title: "Blog", href: "/blog" },
        ],
      }),
    }),
    blogTag: defineLocations({
      locations: [{ title: "Blog", href: "/blog" }],
    }),

    // ───── ebecerra.tech (apps/tech) — hrefs absolutos (otro origen) ─────
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

    // ───── demos.ebecerra.es (apps/demos) — hrefs absolutos (otro origen) ─────
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

export { techOrigin, demosOrigin };
