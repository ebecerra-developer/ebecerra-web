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
  "Webs a medida para autónomos y PYMEs en dos modalidades de pago (contrato de servicio o pago único) y tres niveles de complejidad. Hosting, mantenimiento y add-ons opcionales.";
const DEFAULT_ORG_DESC_EN =
  "Custom websites for freelancers and SMBs in two payment paths (service contract or one-time) and three complexity tiers. Hosting, maintenance and optional add-ons.";

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

// "900 €" / "1.500 €" / "2.000 €" → "900" / "1500" / "2000"
function parsePriceAmount(price: string | null | undefined): string | null {
  if (!price) return null;
  const digits = price.replace(/[^\d]/g, "");
  return digits.length > 0 ? digits : null;
}

function buildTierDescription(
  tier: ServicesPricingTier,
  contractTier: ServicesPricingTier | undefined,
  locale: Locale
): string {
  const parts: string[] = [];
  if (contractTier) {
    if (locale === "es") {
      parts.push(
        `Pago único ${tier.priceMain} o contrato desde ${contractTier.priceMain}${
          contractTier.priceSecondary ? ` ${contractTier.priceSecondary}` : ""
        }.`
      );
    } else {
      parts.push(
        `One-time ${tier.priceMain} or contract from ${contractTier.priceMain}${
          contractTier.priceSecondary ? ` ${contractTier.priceSecondary}` : ""
        }.`
      );
    }
  } else if (tier.conditions) {
    parts.push(`${tier.priceMain} · ${tier.conditions}`);
  } else {
    parts.push(tier.priceMain);
  }

  const featureSummary = tier.features
    .slice(0, 3)
    .map((f) => f.text)
    .join(" · ");
  if (featureSummary) parts.push(featureSummary);

  return parts.join(" ");
}

function buildServiceGraph(pricing: ServicesPricing | null, locale: Locale) {
  const canonical = locale === "es" ? SITE_URL : `${SITE_URL}/${locale}`;

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

  // Source of truth: la pareja de paths del singleton. Si no hay pricing aún
  // (Sanity vacío o caído), emitimos solo el aggregate y dejamos que el SEO
  // siga vivo aunque sin tier-level entries.
  const oneTimePath = pricing?.paths.find((p) => p.id === "oneTime");
  const contractPath = pricing?.paths.find((p) => p.id === "contract");
  if (!oneTimePath || oneTimePath.tiers.length === 0) return [aggregate];

  const tierItems = oneTimePath.tiers.map((tier) => {
    const contractTier = contractPath?.tiers.find((t) => t.id === tier.id);
    const oneTimeAmount = parsePriceAmount(tier.priceMain);
    const contractSetupAmount = contractTier
      ? parsePriceAmount(contractTier.priceMain)
      : null;

    // Si tenemos los dos precios → AggregateOffer (low/high). Si solo uno → Offer simple.
    let offers: Record<string, unknown>;
    if (contractSetupAmount && oneTimeAmount) {
      offers = {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        lowPrice: contractSetupAmount,
        highPrice: oneTimeAmount,
        offerCount: 2,
        availability: "https://schema.org/InStock",
        url: `${canonical}#servicios`,
      };
    } else if (oneTimeAmount) {
      offers = {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: oneTimeAmount,
        availability: "https://schema.org/InStock",
        url: `${canonical}#servicios`,
      };
    } else {
      offers = {
        "@type": "Offer",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: `${canonical}#servicios`,
      };
    }

    return {
      "@type": "Service",
      "@id": `${SITE_URL}/#service-${tier.id}`,
      name: tier.name,
      description: buildTierDescription(tier, contractTier, locale),
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
