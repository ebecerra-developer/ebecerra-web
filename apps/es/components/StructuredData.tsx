import type { Locale } from "@/i18n/routing";

const SITE_URL = "https://ebecerra.es";
const TECH_URL = "https://ebecerra.tech";
const PERSON_URL = `${SITE_URL}/#person`;
const ORG_URL = `${SITE_URL}/#organization`;
const WEBSITE_URL = `${SITE_URL}/#website`;
const SERVICE_URL = `${SITE_URL}/#service`;

type Props = { locale: Locale };

export default function StructuredData({ locale }: Props) {
  const inLang = locale === "es" ? "es-ES" : "en-US";
  const canonical = locale === "es" ? SITE_URL : `${SITE_URL}/${locale}`;

  const person = {
    "@type": "Person",
    "@id": PERSON_URL,
    name: "Enrique Becerra",
    alternateName: "eBecerra",
    url: SITE_URL,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    jobTitle:
      locale === "es"
        ? "Tech Architect Lead y desarrollador freelance"
        : "Tech Architect Lead and freelance developer",
    description:
      locale === "es"
        ? "Tech Architect Lead con más de 8 años de experiencia. Desarrollo webs profesionales para autónomos y PYMEs con Next.js, Sanity y arquitecturas modernas."
        : "Tech Architect Lead with 8+ years of experience. I build professional websites for freelancers and SMBs using Next.js, Sanity and modern architectures.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    email: "mailto:contacto@ebecerra.es",
    sameAs: [
      "https://www.linkedin.com/in/enrique-becerra-garcia/",
      "https://github.com/Quiquebgit",
      TECH_URL,
    ],
    knowsAbout: [
      "Next.js",
      "React",
      "Sanity CMS",
      "Magnolia CMS",
      "Java",
      "TypeScript",
      "Web Architecture",
      "SEO",
    ],
    worksFor: { "@id": ORG_URL },
  };

  const organization = {
    "@type": "ProfessionalService",
    "@id": ORG_URL,
    name: "Enrique Becerra — Desarrollo web freelance",
    alternateName: "eBecerra",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    description:
      locale === "es"
        ? "Servicios de desarrollo web profesional para autónomos y PYMEs: landing pages de conversión, sitios con CMS, ecommerce y arquitecturas Next.js."
        : "Professional web development services for freelancers and SMBs: conversion landing pages, CMS-driven sites, ecommerce and Next.js architectures.",
    founder: { "@id": PERSON_URL },
    areaServed: [
      { "@type": "Country", name: "Spain" },
      { "@type": "Place", name: "Remote / Worldwide" },
    ],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressCountry: "ES",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "contacto@ebecerra.es",
      contactType: "customer support",
      areaServed: ["ES", "Worldwide"],
      availableLanguage: ["Spanish", "English"],
    },
    sameAs: [
      "https://www.linkedin.com/in/enrique-becerra-garcia/",
      "https://github.com/Quiquebgit",
      TECH_URL,
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_URL,
    url: SITE_URL,
    name: "Enrique Becerra",
    inLanguage: inLang,
    publisher: { "@id": ORG_URL },
    about: { "@id": PERSON_URL },
  };

  const service = {
    "@type": "Service",
    "@id": SERVICE_URL,
    serviceType:
      locale === "es"
        ? "Desarrollo web para autónomos y PYMEs"
        : "Web development for freelancers and SMBs",
    provider: { "@id": ORG_URL },
    areaServed: [
      { "@type": "Country", name: "Spain" },
      { "@type": "Place", name: "Remote / Worldwide" },
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType:
        locale === "es"
          ? "Autónomos y pequeñas y medianas empresas"
          : "Freelancers and small-to-medium businesses",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${canonical}#servicios`,
    },
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [person, organization, website, service],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
