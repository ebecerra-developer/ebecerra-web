import type { Locale } from "@/i18n/routing";
import type {
  Feature,
  Service,
  ProcessStep,
  CaseStudySummary,
  CaseStudyMetric,
} from "@ebecerra/sanity-client";

export type { Feature, Service, ProcessStep, CaseStudySummary, CaseStudyMetric };

export type FooterLink = { label: string; url: string; external?: boolean };

export type FeaturedCase = CaseStudySummary & {
  metrics: CaseStudyMetric[];
};

type Fallback = {
  services: Service[];
  processSteps: ProcessStep[];
  featuredCase: FeaturedCase | null;
  aboutFeatures: Feature[];
  footerLinks: FooterLink[];
};

const es: Fallback = {
  services: [
    {
      _id: "fallback-service-web-cms",
      title: "Web con CMS profesional",
      slug: "web-cms-profesional",
      icon: "📝",
      summary:
        "Tu equipo publica sin depender del desarrollador. Editor visual, permisos por rol y previews seguros.",
      description: null,
      deliverables: [
        "CMS profesional con editor visual",
        "permisos por rol y previews seguros",
        "plantillas y componentes reutilizables",
        "formación al equipo editorial",
      ],
      priceRange: "desde 2.800€",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-migracion",
      title: "Migración sin perder lo que funciona",
      slug: "migracion-stack-moderno",
      icon: "🔁",
      summary:
        "De WordPress cargado de plugins o web a medida abandonada a algo que tu equipo puede mantener. Sin perder SEO ni contenido.",
      description: null,
      deliverables: [
        "auditoría previa de URLs y contenido",
        "redirecciones 301 sistemáticas",
        "contenido migrado con estructura limpia",
        "periodo de coexistencia y auditoría post-migración",
      ],
      priceRange: "desde 3.500€",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-auditoria",
      title: "Auditoría técnica y arquitectura",
      slug: "auditoria-tecnica",
      icon: "🔍",
      summary:
        "Segunda opinión sobre tu web actual o sobre una propuesta técnica. Informe accionable en lenguaje de negocio.",
      description: null,
      deliverables: [
        "auditoría de rendimiento y Core Web Vitals",
        "revisión de stack y arquitectura",
        "roadmap priorizado a 90 días",
        "1h de debrief en vídeo",
      ],
      priceRange: "desde 800€",
      priceNote: null,
      featured: true,
    },
  ],
  processSteps: [
    {
      _id: "fallback-step-1",
      title: "Conversación",
      description:
        "Me escribes, hablamos 30 minutos y entiendo qué necesitas, qué restricciones tienes y en qué plazo. Sin compromiso.",
      icon: "💬",
      order: 1,
    },
    {
      _id: "fallback-step-2",
      title: "Propuesta cerrada",
      description:
        "Te mando alcance, hitos semanales y presupuesto cerrado. Si hay riesgo lo marco; si algo no merece la pena, te lo digo.",
      icon: "📋",
      order: 2,
    },
    {
      _id: "fallback-step-3",
      title: "Construcción con avances",
      description:
        "Diseño y desarrollo con entorno de preview desde la semana 1. Tú ves cada avance, yo ejecuto, decides sobre algo tangible.",
      icon: "🔨",
      order: 3,
    },
    {
      _id: "fallback-step-4",
      title: "Entrega y autonomía",
      description:
        "Te entrego la web en producción, formación de uso para tu equipo y 3 meses de soporte incluidos. Después sigues teniéndome a un email.",
      icon: "🚀",
      order: 4,
    },
  ],
  featuredCase: {
    _id: "fallback-case-migracion-seo",
    title: "Migración de portal institucional sin perder posicionamiento",
    slug: "migracion-portal-sin-perder-seo",
    client: "sector público",
    clientAnonymized: true,
    year: 2024,
    summary:
      "Portal con miles de páginas, años de historia y tráfico orgánico crítico migrado a una plataforma moderna que el equipo puede mantener. Cero pérdida medible de posiciones.",
    cover: null,
    featured: true,
    metrics: [
      { label: "pérdida SEO", value: "0%" },
      { label: "URLs migradas", value: "miles" },
      { label: "plazo", value: "3 meses" },
    ],
  },
  aboutFeatures: [
    {
      icon: "🏛️",
      label: "Rigor enterprise a tu escala",
      desc: "8 años construyendo webs para organizaciones que no pueden permitirse que su web falle. Mismo oficio adaptado a tu negocio.",
    },
    {
      icon: "🔌",
      label: "Integraciones que sobreviven",
      desc: "Conecto tu web con CRM, ERP, pasarelas o mailing con el mismo patrón que he usado en intranets corporativas con sistemas heterogéneos.",
    },
    {
      icon: "🧭",
      label: "Criterio antes que código",
      desc: "Decisiones arquitectónicas claras antes de empezar. Menos revertir después, menos sorpresas en la factura.",
    },
  ],
  footerLinks: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/enrique-becerra-garcia/", external: true },
    { label: "GitHub", url: "https://github.com/Quiquebgit", external: true },
    { label: "Email", url: "mailto:contacto@ebecerra.es" },
  ],
};

const en: Fallback = {
  services: [
    {
      _id: "fallback-service-web-cms",
      title: "Website with a professional CMS",
      slug: "web-cms-profesional",
      icon: "📝",
      summary:
        "Your team publishes without waiting on a developer. Visual editor, role-based permissions and safe previews.",
      description: null,
      deliverables: [
        "professional CMS with visual editor",
        "role-based permissions and safe previews",
        "reusable templates and components",
        "editorial team training",
      ],
      priceRange: "from €2,800",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-migracion",
      title: "Migration without losing what works",
      slug: "migracion-stack-moderno",
      icon: "🔁",
      summary:
        "From plugin-heavy WordPress or abandoned custom sites to something your team can maintain. No SEO or content loss.",
      description: null,
      deliverables: [
        "URL and content audit upfront",
        "systematic 301 redirects",
        "content migrated with clean structure",
        "coexistence window and post-migration audit",
      ],
      priceRange: "from €3,500",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-auditoria",
      title: "Technical audit and architecture",
      slug: "auditoria-tecnica",
      icon: "🔍",
      summary:
        "Second opinion on your current site or on a proposed architecture. Actionable report in plain business language.",
      description: null,
      deliverables: [
        "performance and Core Web Vitals audit",
        "stack and architecture review",
        "90-day prioritized roadmap",
        "1h video debrief",
      ],
      priceRange: "from €800",
      priceNote: null,
      featured: true,
    },
  ],
  processSteps: [
    {
      _id: "fallback-step-1",
      title: "Conversation",
      description:
        "You reach out, we talk for 30 minutes and I understand what you need, what constraints you have and the timeline. No strings attached.",
      icon: "💬",
      order: 1,
    },
    {
      _id: "fallback-step-2",
      title: "Closed proposal",
      description:
        "You get scope, weekly milestones and a closed budget. If there's risk I flag it; if something isn't worth doing, I say so.",
      icon: "📋",
      order: 2,
    },
    {
      _id: "fallback-step-3",
      title: "Build with weekly progress",
      description:
        "Design and development with a preview environment from week 1. You see every step, I execute, you decide on something tangible.",
      icon: "🔨",
      order: 3,
    },
    {
      _id: "fallback-step-4",
      title: "Delivery and autonomy",
      description:
        "Live website, hands-on training for your team and 3 months of support included. After that I'm still one email away.",
      icon: "🚀",
      order: 4,
    },
  ],
  featuredCase: {
    _id: "fallback-case-migracion-seo",
    title: "Institutional portal migration with zero SEO loss",
    slug: "migracion-portal-sin-perder-seo",
    client: "public sector",
    clientAnonymized: true,
    year: 2024,
    summary:
      "A portal with thousands of pages, years of history and critical organic traffic, migrated to a modern platform the team can maintain. No measurable loss of positions.",
    cover: null,
    featured: true,
    metrics: [
      { label: "SEO loss", value: "0%" },
      { label: "URLs migrated", value: "thousands" },
      { label: "timeline", value: "3 months" },
    ],
  },
  aboutFeatures: [
    {
      icon: "🏛️",
      label: "Enterprise rigor at your scale",
      desc: "8 years building websites for organizations that can't afford their site to fail. Same craft, scaled to your business.",
    },
    {
      icon: "🔌",
      label: "Integrations that survive",
      desc: "I connect your site with CRM, ERP, payment gateways or mailing using the same pattern proven on corporate intranets with heterogeneous systems.",
    },
    {
      icon: "🧭",
      label: "Judgment before code",
      desc: "Clear architectural decisions before we start. Less to revert later, fewer surprises on the invoice.",
    },
  ],
  footerLinks: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/enrique-becerra-garcia/", external: true },
    { label: "GitHub", url: "https://github.com/Quiquebgit", external: true },
    { label: "Email", url: "mailto:contacto@ebecerra.es" },
  ],
};

export function getFallback(locale: Locale): Fallback {
  return locale === "en" ? en : es;
}
