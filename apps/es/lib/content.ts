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
      _id: "fallback-service-web",
      title: "Web profesional desde cero",
      slug: "web-profesional",
      icon: null,
      summary:
        "Tu presencia digital con stack moderno pensado para que dure años, no modas.",
      description: null,
      deliverables: [
        "next.js + sanity cms",
        "diseño a medida",
        "seo técnico",
        "deploy + dominio",
      ],
      priceRange: "2.500€",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-migracion",
      title: "Migración a stack moderno",
      slug: "migracion",
      icon: null,
      summary:
        "De WordPress/Joomla legacy a Next.js + CMS headless. Sin perder SEO ni contenido.",
      description: null,
      deliverables: [
        "auditoría previa del stack",
        "migración de contenido 1:1",
        "redirects + preservación de seo",
        "formación del equipo editorial",
      ],
      priceRange: "3.500€",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-auditoria",
      title: "Auditoría técnica",
      slug: "auditoria",
      icon: null,
      summary:
        "Revisión de rendimiento, SEO técnico, accesibilidad y arquitectura. Te entrego un informe accionable.",
      description: null,
      deliverables: [
        "audit lighthouse · core web vitals",
        "revisión de stack y arquitectura",
        "roadmap priorizado 90 días",
        "1h de debrief",
      ],
      priceRange: "800€",
      priceNote: null,
      featured: true,
    },
  ],
  processSteps: [
    {
      _id: "fallback-step-1",
      title: "Conversación",
      description: "Me llamas, charlamos 30 min, entiendo qué necesitas.",
      icon: null,
      order: 1,
    },
    {
      _id: "fallback-step-2",
      title: "Propuesta",
      description:
        "Te mando alcance, tiempos y presupuesto cerrado. Sin sorpresas.",
      icon: null,
      order: 2,
    },
    {
      _id: "fallback-step-3",
      title: "Construcción",
      description: "Diseño y desarrollo con avances semanales. Tú decides, yo ejecuto.",
      icon: null,
      order: 3,
    },
    {
      _id: "fallback-step-4",
      title: "Entrega",
      description:
        "Te entrego la web funcionando + 3 meses de soporte incluidos.",
      icon: null,
      order: 4,
    },
  ],
  featuredCase: null,
  aboutFeatures: [
    {
      icon: "⚙️",
      label: "Arquitectura Magnolia",
      desc: "8 años en proyectos Magnolia CMS con equipos editoriales reales.",
    },
    {
      icon: "🏗️",
      label: "Java & Spring",
      desc: "Backend sólido como base — APIs, integraciones, microservicios.",
    },
    {
      icon: "⚡",
      label: "Next.js moderno",
      desc: "Frontend con App Router, RSC, Tailwind v4 y foco en Core Web Vitals.",
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
      _id: "fallback-service-web",
      title: "Professional website from scratch",
      slug: "web-profesional",
      icon: null,
      summary:
        "Your digital presence with a modern stack built to last for years, not trends.",
      description: null,
      deliverables: [
        "next.js + sanity cms",
        "bespoke design",
        "technical seo",
        "deploy + domain",
      ],
      priceRange: "€2,500",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-migracion",
      title: "Migration to a modern stack",
      slug: "migracion",
      icon: null,
      summary:
        "From legacy WordPress/Joomla to Next.js + headless CMS. No SEO or content loss.",
      description: null,
      deliverables: [
        "stack audit upfront",
        "1:1 content migration",
        "redirects + seo preservation",
        "editorial team training",
      ],
      priceRange: "€3,500",
      priceNote: null,
      featured: true,
    },
    {
      _id: "fallback-service-auditoria",
      title: "Technical audit",
      slug: "auditoria",
      icon: null,
      summary:
        "Review of performance, technical SEO, accessibility and architecture. You get an actionable report.",
      description: null,
      deliverables: [
        "lighthouse · core web vitals audit",
        "stack + architecture review",
        "90-day prioritized roadmap",
        "1h debrief",
      ],
      priceRange: "€800",
      priceNote: null,
      featured: true,
    },
  ],
  processSteps: [
    {
      _id: "fallback-step-1",
      title: "Conversation",
      description: "You call me, we chat for 30 min, I understand what you need.",
      icon: null,
      order: 1,
    },
    {
      _id: "fallback-step-2",
      title: "Proposal",
      description:
        "I send you scope, timing and a closed budget. No surprises.",
      icon: null,
      order: 2,
    },
    {
      _id: "fallback-step-3",
      title: "Build",
      description:
        "Design and development with weekly progress. You decide, I execute.",
      icon: null,
      order: 3,
    },
    {
      _id: "fallback-step-4",
      title: "Delivery",
      description:
        "I deliver the website live + 3 months of support included.",
      icon: null,
      order: 4,
    },
  ],
  featuredCase: null,
  aboutFeatures: [
    {
      icon: "⚙️",
      label: "Magnolia architecture",
      desc: "8 years on Magnolia CMS projects with real editorial teams.",
    },
    {
      icon: "🏗️",
      label: "Java & Spring",
      desc: "Solid backend as foundation — APIs, integrations, microservices.",
    },
    {
      icon: "⚡",
      label: "Modern Next.js",
      desc: "Frontend with App Router, RSC, Tailwind v4 and focus on Core Web Vitals.",
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
