import type { Locale } from "@/i18n/routing";
import type { SiteSettingsFull, ProfileFull, Service } from "@ebecerra/sanity-client";

const SITE_URL = "https://ebecerra.es";
const TECH_URL = "https://ebecerra.tech";
const PERSON_URL = `${SITE_URL}/#person`;
const ORG_URL = `${SITE_URL}/#organization`;
const WEBSITE_URL = `${SITE_URL}/#website`;

const DEFAULT_JOB_TITLE_ES = "Desarrollador web freelance para autónomos y PYMEs";
const DEFAULT_JOB_TITLE_EN = "Freelance web developer for freelancers and SMBs";
const DEFAULT_DESC_ES =
  "Desarrollo webs a medida para clínicas, despachos, autónomos y PYMEs. Sin plantillas genéricas. Rápidas, accesibles y pensadas para que tu equipo las mantenga solo.";
const DEFAULT_DESC_EN =
  "I build custom websites for clinics, law firms, freelancers and SMBs. No generic templates. Fast, accessible and designed so your team can run them solo.";
const DEFAULT_ORG_DESC_ES =
  "Webs a medida para clínicas, despachos, autónomos y PYMEs: webs profesionales de presencia, webs editables con CMS, rescate de webs antiguas sin perder SEO y mantenimiento mensual.";
const DEFAULT_ORG_DESC_EN =
  "Custom websites for clinics, law firms, freelancers and SMBs: professional presence sites, editable CMS-powered sites, rescue of legacy sites without SEO loss, and monthly maintenance.";

type Props = {
  settings: SiteSettingsFull;
  profile: ProfileFull | null;
  services: Service[];
  locale: Locale;
};

function buildSameAs(
  profile: ProfileFull | null,
  settings: SiteSettingsFull
): string[] {
  const links = [
    profile?.contact?.linkedinUrl,
    ...settings.footer.socialLinks.map((s) => s.url),
    TECH_URL,
  ].filter((v): v is string => Boolean(v));
  return [...new Set(links)];
}

function buildPerson(
  profile: ProfileFull | null,
  settings: SiteSettingsFull,
  locale: Locale
) {
  const sameAs = buildSameAs(profile, settings);
  return {
    "@type": "Person",
    "@id": PERSON_URL,
    name: profile?.name ?? "Enrique Becerra",
    alternateName: "eBecerra",
    url: SITE_URL,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    jobTitle:
      profile?.jobTitle ??
      (locale === "es" ? DEFAULT_JOB_TITLE_ES : DEFAULT_JOB_TITLE_EN),
    description:
      profile?.bio1 ??
      (locale === "es" ? DEFAULT_DESC_ES : DEFAULT_DESC_EN),
    address: {
      "@type": "PostalAddress",
      addressLocality: profile?.contact?.location ?? "Madrid",
      addressCountry: "ES",
    },
    email: profile?.contact?.email
      ? `mailto:${profile.contact.email}`
      : "mailto:contacto@ebecerra.es",
    sameAs,
    knowsAbout: [
      "Desarrollo web a medida",
      "Accesibilidad web",
      "Rendimiento web",
      "Migraciones CMS",
      "Arquitectura web",
      "SEO",
    ],
    worksFor: { "@id": ORG_URL },
  };
}

function buildOrganization(
  settings: SiteSettingsFull,
  profile: ProfileFull | null,
  locale: Locale
) {
  const sameAs = buildSameAs(profile, settings);
  return {
    "@type": "ProfessionalService",
    "@id": ORG_URL,
    name:
      settings.metadata.title ??
      "Enrique Becerra — Desarrollo web freelance",
    alternateName: "eBecerra",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    description:
      settings.metadata.description ??
      (locale === "es" ? DEFAULT_ORG_DESC_ES : DEFAULT_ORG_DESC_EN),
    founder: { "@id": PERSON_URL },
    areaServed: [
      { "@type": "Country", name: "Spain" },
      { "@type": "Place", name: "Remote / Worldwide" },
    ],
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      addressLocality: profile?.contact?.location ?? "Madrid",
      addressCountry: "ES",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: profile?.contact?.email ?? "contacto@ebecerra.es",
      contactType: "customer support",
      areaServed: ["ES", "Worldwide"],
      availableLanguage: ["Spanish", "English"],
    },
    sameAs,
  };
}

function buildWebsite(locale: Locale) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_URL,
    url: SITE_URL,
    name: "Enrique Becerra",
    inLanguage: locale === "es" ? "es-ES" : "en-US",
    publisher: { "@id": ORG_URL },
    about: { "@id": PERSON_URL },
  };
}

function buildServiceGraph(services: Service[], locale: Locale) {
  const canonical = locale === "es" ? SITE_URL : `${SITE_URL}/${locale}`;
  const serviceItems = services.map((s) => ({
    "@type": "Service",
    "@id": `${SITE_URL}/#service-${s.slug}`,
    name: s.title,
    description: s.summary,
    provider: { "@id": ORG_URL },
    url: `${canonical}#servicios`,
  }));

  const aggregate = {
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
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

  return serviceItems.length > 0 ? [...serviceItems, aggregate] : [aggregate];
}

export default function StructuredData({ settings, profile, services, locale }: Props) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(profile, settings, locale),
      buildOrganization(settings, profile, locale),
      buildWebsite(locale),
      ...buildServiceGraph(services, locale),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
