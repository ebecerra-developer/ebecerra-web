import type { Locale } from "@/i18n/routing";
import type {
  SiteSettingsFull,
  ProfileFull,
  ServicesPricing,
  ServicesPricingTier,
} from "@ebecerra/sanity-client";

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
  "Webs y tiendas online a medida para autónomos y PYMEs con una cuota mensual todo incluido: alta única + cuota con hosting, mantenimiento y soporte. Sin permanencia. Landing, portfolio, web completa y ecommerce, más add-ons opcionales.";
const DEFAULT_ORG_DESC_EN =
  "Custom websites and online stores for freelancers and SMBs on an all-inclusive monthly plan: one-off setup + a fee covering hosting, maintenance and support. No lock-in. Landing, portfolio, full website and ecommerce, plus optional add-ons.";
// Desambiguación de entidad: distingue a este Enrique Becerra (web freelance,
// Madrid, founder de eBecerra) de homónimos (hostelero, académico, etc.).
const DISAMBIG_ES =
  "Desarrollador web freelance afincado en Madrid, especializado en webs a medida para autónomos y pequeñas empresas. Fundador de eBecerra (ebecerra.es).";
const DISAMBIG_EN =
  "Freelance web developer based in Madrid, specialized in custom websites for freelancers and small businesses. Founder of eBecerra (ebecerra.es).";

type Props = {
  settings: SiteSettingsFull;
  profile: ProfileFull | null;
  pricing: ServicesPricing | null;
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
  const aboutUrl =
    locale === "es" ? `${SITE_URL}/sobre-mi/` : `${SITE_URL}/${locale}/sobre-mi/`;
  return {
    "@type": "Person",
    "@id": PERSON_URL,
    name: profile?.name ?? "Enrique Becerra",
    givenName: "Enrique",
    familyName: "Becerra García",
    alternateName: "eBecerra",
    url: SITE_URL,
    mainEntityOfPage: aboutUrl,
    image: `${SITE_URL}/brand/web-app-manifest-512x512.png`,
    jobTitle:
      profile?.jobTitle ??
      (locale === "es" ? DEFAULT_JOB_TITLE_ES : DEFAULT_JOB_TITLE_EN),
    description:
      profile?.bio1 ??
      (locale === "es" ? DEFAULT_DESC_ES : DEFAULT_DESC_EN),
    disambiguatingDescription: locale === "es" ? DISAMBIG_ES : DISAMBIG_EN,
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

// "450 €" → "450" · "1.190 €" → "1190". Toma solo el PRIMER grupo numérico para
// que un priceMain con dos cifras (p.ej. "450 € + 22 €/mes") no concatene basura.
function parsePriceAmount(price: string | null | undefined): string | null {
  if (!price) return null;
  const match = price.match(/[\d.]+/);
  if (!match) return null;
  const digits = match[0].replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

function buildTierDescription(
  tier: ServicesPricingTier,
  locale: Locale
): string {
  const parts: string[] = [];
  const price = tier.priceSecondary
    ? `${tier.priceMain} ${tier.priceSecondary}`
    : tier.priceMain;
  parts.push(locale === "es" ? `Desde ${price}.` : `From ${price}.`);
  if (tier.subtitle) parts.push(tier.subtitle);

  const featureSummary = tier.features
    .slice(0, 3)
    .map((f) => f.text)
    .join(" · ");
  if (featureSummary) parts.push(featureSummary);

  return parts.join(" ");
}

function buildServiceGraph(pricing: ServicesPricing | null, locale: Locale) {
  const canonical = locale === "es" ? SITE_URL : `${SITE_URL}/${locale}`;

  // Source of truth: el único camino del singleton ('plans').
  const plansPath =
    pricing?.paths.find((p) => p.isDefault) ?? pricing?.paths[0];
  const tiers = plansPath?.tiers ?? [];
  const amounts = tiers
    .map((t) => parsePriceAmount(t.priceMain))
    .filter((a): a is string => !!a)
    .map(Number);

  // AggregateOffer necesita lowPrice para ser válido en Google (rich result).
  const aggregateOffers: Record<string, unknown> = {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${canonical}#servicios`,
  };
  if (amounts.length) {
    aggregateOffers.lowPrice = Math.min(...amounts);
    aggregateOffers.offerCount = amounts.length;
  }

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
    offers: aggregateOffers,
  };

  // Si no hay pricing aún (Sanity vacío o caído), emitimos solo el aggregate y
  // dejamos que el SEO siga vivo aunque sin tier-level entries.
  if (tiers.length === 0) return [aggregate];

  const tierItems = tiers.map((tier) => {
    // priceMain = alta (setup). priceSecondary = cuota mensual (texto).
    const setupAmount = parsePriceAmount(tier.priceMain);

    const offers: Record<string, unknown> = {
      "@type": "Offer",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${canonical}#servicios`,
    };
    if (setupAmount) offers.price = setupAmount;

    return {
      "@type": "Service",
      "@id": `${SITE_URL}/#service-${tier.id}`,
      name: tier.name,
      description: buildTierDescription(tier, locale),
      provider: { "@id": ORG_URL },
      url: `${canonical}#servicios`,
      offers,
    };
  });

  return [...tierItems, aggregate];
}

export default function StructuredData({ settings, profile, pricing, locale }: Props) {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      buildPerson(profile, settings, locale),
      buildOrganization(settings, profile, locale),
      buildWebsite(locale),
      ...buildServiceGraph(pricing, locale),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
