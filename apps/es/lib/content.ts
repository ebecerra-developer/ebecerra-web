import type { Locale } from "@/i18n/routing";
import type {
  Feature,
  ProcessStep,
  CaseStudySummary,
  CaseStudyMetric,
} from "@ebecerra/sanity-client";

export type { Feature, ProcessStep, CaseStudySummary, CaseStudyMetric };

export type FooterLink = { label: string; url: string; external?: boolean };

export type FeaturedCase = CaseStudySummary & {
  metrics: CaseStudyMetric[];
};

export type CaseCard = {
  _id: string;
  slug: string;
  sector: string;
  title: string;
  context: string;
  solution: string;
  result: string;
  translatesTo: string;
  metrics: CaseStudyMetric[];
};

type Fallback = {
  processSteps: ProcessStep[];
  featuredCase: FeaturedCase | null;
  cases: CaseCard[];
  aboutFeatures: Feature[];
  footerLinks: FooterLink[];
};

const es: Fallback = {
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
  featuredCase: null,
  cases: [
    {
      _id: "case-cms-financiero",
      slug: "plataforma-cms-financiero",
      sector: "Sector financiero · web corporativa",
      title: "Plataforma web corporativa con CMS profesional",
      context:
        "Organización de tamaño medio-grande en el sector financiero. Equipo de marketing interno que necesitaba mantener y evolucionar la web sin dependencia constante del equipo de desarrollo.",
      solution:
        "Web construida sobre CMS profesional con plantillas a medida, componentes reutilizables, permisos por rol y previsualización antes de publicar. Formación al equipo de contenidos para autonomía completa.",
      result:
        "El equipo de marketing publica páginas nuevas el mismo día. Los desarrollos se concentran en mejoras reales, no en mantenimiento de contenido.",
      translatesTo:
        "Cualquier negocio con catálogo, blog o secciones que cambian cada mes puede operar así. La diferencia es el volumen, no la filosofía.",
      metrics: [
        { label: "rol", value: "Líder técnico" },
        { label: "stack", value: "Magnolia · Java" },
      ],
    },
    {
      _id: "case-migracion-seo",
      slug: "migracion-portal-sin-perder-seo",
      sector: "Sector público · migración de portal",
      title: "Migración de portal institucional sin perder posicionamiento",
      context:
        "Portal con años de historia, miles de páginas indexadas, tráfico orgánico crítico y una plataforma antigua que ya no se podía mantener.",
      solution:
        "Migración planificada por fases. Análisis previo de URLs, contenido y funcionalidad. Redirecciones 301 sistemáticas. Coexistencia controlada durante el cambio y auditoría post-migración.",
      result:
        "Cero pérdida de posiciones SEO medibles. Contenido migrado con estructura limpia. Plataforma nueva que el equipo puede mantener.",
      translatesTo:
        "El mismo proceso funciona a escala pequeña. Una web con 100 entradas sobre un CMS tradicional migrada a una plataforma moderna sigue el mismo playbook que una con 10.000.",
      metrics: [
        { label: "pérdida SEO", value: "0%" },
        { label: "URLs migradas", value: "miles" },
      ],
    },
    {
      _id: "case-generador-multisede",
      slug: "generador-portales-multi-sede",
      sector: "Red institucional · multi-sede",
      title: "Generador automático de portales multi-sede",
      context:
        "Red institucional con cientos de sedes independientes que necesitaban cada una su propia web, con identidad visual común pero contenido local.",
      solution:
        "Generador de portales desplegado sobre una plataforma central. Plantillas parametrizadas; cada sede con URL propia, contenido editable por su responsable local y diseño coherente con la marca común.",
      result:
        "Cientos de portales desplegados. Mantenimiento centralizado — un cambio de plantilla aplica a todos. Autonomía editorial por sede.",
      translatesTo:
        "Cadenas de franquicias, academias con varias sedes, agencias inmobiliarias multi-oficina, SaaS con producto white-label. Cuando tienes «muchos iguales con pequeñas diferencias», una plataforma multi-tenant se paga en meses.",
      metrics: [
        { label: "sedes", value: "cientos" },
        { label: "mantenimiento", value: "centralizado" },
      ],
    },
  ],
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
    { label: "Email", url: "mailto:contacto@ebecerra.es" },
  ],
};

const en: Fallback = {
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
  featuredCase: null,
  cases: [
    {
      _id: "case-cms-financiero",
      slug: "plataforma-cms-financiero",
      sector: "Financial sector · corporate site",
      title: "Corporate web platform with a professional CMS",
      context:
        "Mid-to-large organization in the financial sector. Internal marketing team that needed to maintain and grow the site without constant dependency on the development team.",
      solution:
        "Website built on a professional CMS with tailored templates, reusable components, role-based permissions and preview before publish. Content team training for full autonomy.",
      result:
        "The marketing team ships new pages the same day. Development focuses on real improvements, not on content maintenance.",
      translatesTo:
        "Any business with a catalog, blog or sections that change monthly can operate this way. The difference is volume, not philosophy.",
      metrics: [
        { label: "role", value: "Tech lead" },
        { label: "stack", value: "Magnolia · Java" },
      ],
    },
    {
      _id: "case-migracion-seo",
      slug: "migracion-portal-sin-perder-seo",
      sector: "Public sector · portal migration",
      title: "Institutional portal migration with zero SEO loss",
      context:
        "Portal with years of history, thousands of indexed pages, critical organic traffic and a legacy platform that could no longer be maintained.",
      solution:
        "Phased migration. Upfront audit of URLs, content and functionality. Systematic 301 redirects. Controlled coexistence during the switch and a post-migration audit.",
      result:
        "Zero measurable SEO position loss. Content migrated with clean structure. New platform the team can maintain.",
      translatesTo:
        "The same process works at small scale. A legacy-CMS site with 100 posts migrated to a modern platform follows the same playbook as one with 10,000.",
      metrics: [
        { label: "SEO loss", value: "0%" },
        { label: "URLs migrated", value: "thousands" },
      ],
    },
    {
      _id: "case-generador-multisede",
      slug: "generador-portales-multi-sede",
      sector: "Institutional network · multi-site",
      title: "Automatic multi-site portal generator",
      context:
        "Institutional network with hundreds of independent branches, each needing its own website with a shared visual identity and local content.",
      solution:
        "Portal generator deployed on a central platform. Parameterized templates; each branch gets its own URL, content editable by its local owner and design consistent with the shared brand.",
      result:
        "Hundreds of portals deployed. Centralized maintenance — one template change applies to all. Editorial autonomy per branch.",
      translatesTo:
        "Franchise chains, academies with several branches, multi-office real-estate agencies, white-label SaaS. When you have 'many alike with small differences', a multi-tenant platform pays for itself in months.",
      metrics: [
        { label: "branches", value: "hundreds" },
        { label: "maintenance", value: "centralized" },
      ],
    },
  ],
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
    { label: "Email", url: "mailto:contacto@ebecerra.es" },
  ],
};

export function getFallback(locale: Locale): Fallback {
  return locale === "en" ? en : es;
}
