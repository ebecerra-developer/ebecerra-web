import { client } from "./client";
import type {
  ExperienceItem,
  Skill,
  Project,
  Feature,
  Service,
  ProcessStep,
  CaseStudy,
  CaseStudySummary,
  CaseStudyMetric,
  HeroSection,
  SiteSettingsMeta,
  SiteSettingsFooter,
  SiteSettingsFull,
  ProfileContact,
  Locale,
  SectionMeta,
  ServiceSectionMeta,
  FaqPageData,
  FaqItem,
  LegalPageData,
  ProfileFull,
  DemoSite,
  DemoSiteSummary,
  ChatbotConfig,
  BlogAuthor,
  BlogCategory,
  BlogTag,
  PostListItem,
  PostFull,
} from "./types";

// Proyección reutilizable para el objeto chatbot (embebido en profile y demoSite).
const chatbotProjection = (loc: (f: string) => string) => `chatbot {
  "enabled": coalesce(enabled, false),
  "label": ${loc("label")},
  "title": ${loc("title")},
  "greeting": ${loc("greeting")},
  "placeholder": ${loc("placeholder")},
  "systemPrompt": ${loc("systemPrompt")},
  "disclaimers": disclaimers[]{ "v": coalesce(@[$locale], @.es, @) }
}`;

type RawChatbot = Omit<ChatbotConfig, "disclaimers"> & {
  disclaimers: { v: string }[] | null;
};

const normalizeChatbot = (raw: RawChatbot | null): ChatbotConfig | null => {
  if (!raw) return null;
  return {
    ...raw,
    disclaimers: (raw.disclaimers ?? []).map((d) => d.v).filter(Boolean),
  };
};

// coalesce(field[$locale], field.es, field) → soporta:
//  1. { es, en } (nuevo formato localeString) con fallback a ES
//  2. string plano (legacy, durante migración) — field no es objeto, field[$locale] y field.es son null, coalesce devuelve field tal cual.
const loc = (field: string) =>
  `coalesce(${field}[$locale], ${field}.es, ${field})`;

export async function getSiteData(locale: Locale) {
  const params = { locale };

  const [experienceItemsRaw, skillItems, techTagItems, projectItems, profileData] =
    await Promise.all([
      client.fetch<Array<Omit<ExperienceItem, "tech"> & { tech: { v: string }[] | null }>>(
        `*[_type == "experience"] | order(order asc) {
          company,
          "role": ${loc("role")},
          period,
          tag,
          "desc": ${loc("desc")},
          "tech": tech[]{ "v": coalesce(@[$locale], @.es, @) }
        }`,
        params
      ),
      client.fetch<Skill[]>(
        `*[_type == "skill"] | order(order asc) {
          "name": ${loc("name")},
          level
        }`,
        params
      ),
      client.fetch<{ name: string }[]>(
        `*[_type == "techTag"] | order(order asc) {
          "name": ${loc("name")}
        }`,
        params
      ),
      client.fetch<(Omit<Project, "id"> & { id: { current: string } })[]>(
        `*[_type == "project"] | order(order asc) {
          "id": id.current,
          label,
          "title": ${loc("title")},
          "description": ${loc("description")},
          tech,
          status,
          "statusText": ${loc("statusText")},
          "links": links[]{
            "text": ${loc("text")},
            href,
            external
          }
        }`,
        params
      ),
      client.fetch<{ aboutFeatures: Feature[] } | null>(
        `*[_type == "profile"][0] {
          "aboutFeatures": aboutFeatures[]{
            icon,
            "label": ${loc("label")},
            "desc": ${loc("desc")}
          }
        }`,
        params
      ),
    ]);

  const experienceItems: ExperienceItem[] = experienceItemsRaw.map((e) => ({
    ...e,
    tech: (e.tech ?? []).map((t) => t.v),
  }));

  return {
    experience: experienceItems.length > 0 ? experienceItems : null,
    skills: skillItems.length > 0 ? skillItems : null,
    tags:
      techTagItems.length > 0 ? techTagItems.map((t) => t.name) : null,
    projects:
      projectItems.length > 0
        ? (projectItems as unknown as Project[])
        : null,
    aboutFeatures:
      profileData?.aboutFeatures?.length ? profileData.aboutFeatures : null,
  };
}

// --- Fase A2: heroSection, siteSettings, profileContact ---

export async function getHeroSection(locale: Locale): Promise<HeroSection | null> {
  type Raw = Omit<HeroSection, "trustBadges"> & { trustBadges: { v: string }[] | null };
  const raw = await client.fetch<Raw | null>(
    `*[_type == "heroSection"][0] {
      "kicker": ${loc("kicker")},
      "title": ${loc("title")},
      "lead": ${loc("lead")},
      "ctaPrimary": ${loc("ctaPrimary")},
      "ctaSecondary": ${loc("ctaSecondary")},
      "trustBadges": trustBadges[]{ "v": coalesce(@[$locale], @.es, @) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, trustBadges: (raw.trustBadges ?? []).map((b) => b.v).filter(Boolean) };
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsMeta | null> {
  type Raw = Omit<SiteSettingsMeta, "keywords"> & { keywords: { v: string }[] | null };
  const raw = await client.fetch<Raw | null>(
    `*[_type == "siteSettings"][0].metadata {
      "title": ${loc("title")},
      titleTemplate,
      "description": ${loc("description")},
      "ogDescription": ${loc("ogDescription")},
      "twitterDescription": ${loc("twitterDescription")},
      "keywords": keywords[]{ "v": coalesce(@[$locale], @.es, @) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, keywords: (raw.keywords ?? []).map((k) => k.v).filter(Boolean) };
}

export async function getSiteSettingsFooter(locale: Locale): Promise<SiteSettingsFooter | null> {
  type Raw = Omit<SiteSettingsFooter, "socialLinks"> & { socialLinks: { name: string; url: string; external: boolean }[] | null };
  const raw = await client.fetch<Raw | null>(
    `*[_type == "siteSettings"][0].footer {
      "tagline": ${loc("tagline")},
      "availability": ${loc("availability")},
      email,
      "socialLinks": socialLinks[]{ name, url, "external": coalesce(external, true) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, socialLinks: raw.socialLinks ?? [] };
}

export async function getProfileContact(locale: Locale): Promise<ProfileContact | null> {
  return client.fetch<ProfileContact | null>(
    `*[_type == "profile"][0].contact {
      email,
      linkedinUrl,
      "location": ${loc("location")},
      "responseTime": ${loc("responseTime")}
    }`,
    { locale }
  );
}

// --- Fase 6+: services, processSteps, caseStudies ---

type DeliverableRaw = { text: string };

export async function getServices(locale: Locale): Promise<Service[]> {
  const raw = await client.fetch<Array<Omit<Service, "deliverables"> & { deliverables: DeliverableRaw[] | null }>>(
    `*[_type == "service"] | order(order asc) {
      "_id": _id,
      "title": ${loc("title")},
      "slug": slug.current,
      icon,
      "summary": ${loc("summary")},
      "description": ${loc("description")},
      "deliverables": deliverables[]{ "text": coalesce(@[$locale], @.es, @) },
      priceRange,
      "priceNote": ${loc("priceNote")},
      "featured": coalesce(featured, false)
    }`,
    { locale }
  );
  return raw.map((s) => ({
    ...s,
    deliverables: (s.deliverables ?? []).map((d) => d.text),
  }));
}

export async function getFeaturedServices(locale: Locale): Promise<Service[]> {
  const services = await getServices(locale);
  return services.filter((s) => s.featured);
}

export async function getProcessSteps(locale: Locale): Promise<ProcessStep[]> {
  return client.fetch<ProcessStep[]>(
    `*[_type == "processStep"] | order(order asc) {
      "_id": _id,
      "title": ${loc("title")},
      "description": ${loc("description")},
      icon,
      order
    }`,
    { locale }
  );
}

const caseStudySummaryProjection = `{
  "_id": _id,
  "title": ${loc("title")},
  "slug": slug.current,
  client,
  "clientAnonymized": coalesce(clientAnonymized, false),
  year,
  "summary": ${loc("summary")},
  cover,
  "featured": coalesce(featured, false)
}`;

export async function getCaseStudies(locale: Locale): Promise<CaseStudySummary[]> {
  return client.fetch<CaseStudySummary[]>(
    `*[_type == "caseStudy"] | order(coalesce(order, 9999) asc, year desc) ${caseStudySummaryProjection}`,
    { locale }
  );
}

export async function getFeaturedCaseStudies(
  locale: Locale,
  limit = 3
): Promise<CaseStudySummary[]> {
  return client.fetch<CaseStudySummary[]>(
    `*[_type == "caseStudy" && featured == true] | order(coalesce(order, 9999) asc, year desc) [0...$limit] ${caseStudySummaryProjection}`,
    { locale, limit }
  );
}

/**
 * Caso destacado para la home con métricas incluidas. Devuelve el
 * primer caso marcado como featured (por orden) o `null` si no hay
 * ninguno publicado. La home muestra un placeholder cuando es null.
 */
export async function getFeaturedCaseForHome(
  locale: Locale
): Promise<(CaseStudySummary & { metrics: CaseStudyMetric[] }) | null> {
  const result = await client.fetch<
    (CaseStudySummary & { metrics: CaseStudyMetric[] }) | null
  >(
    `*[_type == "caseStudy" && featured == true] | order(coalesce(order, 9999) asc, year desc) [0] {
      "_id": _id,
      "title": ${loc("title")},
      "slug": slug.current,
      client,
      "clientAnonymized": coalesce(clientAnonymized, false),
      year,
      "summary": ${loc("summary")},
      cover,
      "featured": coalesce(featured, false),
      "metrics": metrics[]{
        "label": ${loc("label")},
        value
      }
    }`,
    { locale }
  );
  return result;
}

/**
 * Features "Sobre mí" desde el singleton `profile`.
 * Devuelve `null` si no hay documento de perfil publicado — la home
 * entonces usa el fallback local.
 */
export async function getProfileFeatures(
  locale: Locale
): Promise<Feature[] | null> {
  const profile = await client.fetch<{ aboutFeatures: Feature[] } | null>(
    `*[_type == "profile"][0] {
      "aboutFeatures": aboutFeatures[]{
        icon,
        "label": ${loc("label")},
        "desc": ${loc("desc")}
      }
    }`,
    { locale }
  );
  return profile?.aboutFeatures?.length ? profile.aboutFeatures : null;
}

export async function getCaseStudyBySlug(
  slug: string,
  locale: Locale
): Promise<CaseStudy | null> {
  return client.fetch<CaseStudy | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0] {
      "_id": _id,
      "title": ${loc("title")},
      "slug": slug.current,
      client,
      "clientAnonymized": coalesce(clientAnonymized, false),
      year,
      "summary": ${loc("summary")},
      "problem": ${loc("problem")},
      "solution": ${loc("solution")},
      "outcome": ${loc("outcome")},
      "metrics": metrics[]{
        "label": ${loc("label")},
        value
      },
      "stack": stack[]->{
        "name": ${loc("name")}
      },
      cover,
      images,
      "body": coalesce(body[$locale], body.es, []),
      "featured": coalesce(featured, false)
    }`,
    { slug, locale }
  );
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return client.fetch<string[]>(
    `*[_type == "caseStudy" && defined(slug.current)].slug.current`
  );
}

// --- Fase A4: section metas, faq, legales, profile extendido ---

export async function getSectionMeta(
  type: "processSectionMeta" | "casesSectionMeta" | "contactSectionMeta",
  locale: Locale
): Promise<SectionMeta | null> {
  return client
    .fetch<SectionMeta | null>(
      `*[_type == $type][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")}
      }`,
      { type, locale }
    )
    .catch(() => null);
}

export async function getServiceSectionMeta(
  locale: Locale
): Promise<ServiceSectionMeta | null> {
  return client
    .fetch<ServiceSectionMeta | null>(
      `*[_type == "serviceSectionMeta"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "auditStrip": auditStrip {
          "kicker": ${loc("kicker")},
          "body": ${loc("body")}
        }
      }`,
      { locale }
    )
    .catch(() => null);
}

export async function getFaqPage(locale: Locale): Promise<FaqPageData | null> {
  return client
    .fetch<FaqPageData | null>(
      `*[_type == "faqPage"][0] {
        "metaTitle": ${loc("metaTitle")},
        "metaDescription": ${loc("metaDescription")},
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "contactSectionTitle": ${loc("contactSectionTitle")},
        "contactSectionLead": ${loc("contactSectionLead")},
        "contactCta": ${loc("contactCta")}
      }`,
      { locale }
    )
    .catch(() => null);
}

export async function getFaqItems(locale: Locale): Promise<FaqItem[]> {
  return client
    .fetch<FaqItem[]>(
      `*[_type == "faqItem"] | order(order asc) {
        "_id": _id,
        "question": ${loc("question")},
        "answer": ${loc("answer")},
        order,
        category
      }`,
      { locale }
    )
    .catch(() => []);
}

export async function getLegalPage(
  slug: string,
  locale: Locale
): Promise<LegalPageData | null> {
  return client
    .fetch<LegalPageData | null>(
      `*[_type == "legalPage" && slug.current == $slug][0] {
        "slug": slug.current,
        "title": ${loc("title")},
        "metaDescription": ${loc("metaDescription")},
        "content": coalesce(content[$locale], content.es, []),
        updatedAt
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getLegalPageSlugs(): Promise<string[]> {
  return client
    .fetch<string[]>(
      `*[_type == "legalPage" && defined(slug.current)].slug.current`
    )
    .catch(() => []);
}

export async function getProfile(locale: Locale): Promise<ProfileFull | null> {
  type Raw = Omit<ProfileFull, "chatbot"> & { chatbot: RawChatbot | null };
  const raw = await client
    .fetch<Raw | null>(
      `*[_type == "profile"][0] {
        name,
        "jobTitle": ${loc("jobTitle")},
        "bio1": ${loc("bio1")},
        "bio2": ${loc("bio2")},
        "stats": stats[]{
          value,
          "label": ${loc("label")}
        },
        "aboutFeatures": aboutFeatures[]{
          icon,
          "label": ${loc("label")},
          "desc": ${loc("desc")}
        },
        "contact": contact {
          email,
          linkedinUrl,
          "location": ${loc("location")},
          "responseTime": ${loc("responseTime")}
        },
        "chatbot": ${chatbotProjection(loc)}
      }`,
      { locale }
    )
    .catch(() => null);
  if (!raw) return null;
  return { ...raw, chatbot: normalizeChatbot(raw.chatbot) };
}

/**
 * Devuelve la configuración del chatbot del profile singleton.
 *
 * `field`:
 *   - "chatbot"     → bot de ebecerra.es (comercial).
 *   - "chatbotTech" → bot de ebecerra.tech (técnico).
 */
export async function getProfileChatbot(
  locale: Locale,
  field: "chatbot" | "chatbotTech" = "chatbot"
): Promise<ChatbotConfig | null> {
  const raw = await client
    .fetch<RawChatbot | null>(
      `*[_type == "profile"][0].${field} {
        "enabled": coalesce(enabled, false),
        "label": ${loc("label")},
        "title": ${loc("title")},
        "greeting": ${loc("greeting")},
        "placeholder": ${loc("placeholder")},
        "systemPrompt": ${loc("systemPrompt")},
        "disclaimers": disclaimers[]{ "v": coalesce(@[$locale], @.es, @) }
      }`,
      { locale }
    )
    .catch(() => null);
  return normalizeChatbot(raw);
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsFull = {
  metadata: {
    title: "Enrique Becerra — Desarrollo web freelance para autónomos y PYMEs",
    titleTemplate: "%s · eBecerra",
    description:
      "Webs a medida para autónomos y PYMEs. Web profesional desde 900 €, web editable con CMS desde 1.500 €, rescate de webs antiguas y mantenimiento mensual.",
    ogDescription: null,
    twitterDescription: null,
    keywords: [],
  },
  footer: {
    tagline: null,
    availability: null,
    email: null,
    socialLinks: [],
  },
};

// ---------- Demos ----------

const demoSiteProjection = `{
  "_id": _id,
  "slug": slug.current,
  template,
  "enableEnglish": coalesce(enableEnglish, false),
  "businessName": ${loc("businessName")},
  "tagline": ${loc("tagline")},
  "brand": brand {
    logo,
    primaryColor,
    accentColor,
    inkColor,
    bgTone,
    fontPair
  },
  "hero": hero {
    "kicker": ${loc("kicker")},
    "heading": ${loc("heading")},
    "sub": ${loc("sub")},
    image,
    "ctaPrimary": {
      "label": ${loc("ctaPrimaryLabel")},
      "href": ctaPrimaryHref
    },
    "ctaSecondary": {
      "label": ${loc("ctaSecondaryLabel")},
      "href": ctaSecondaryHref
    }
  },
  "coachStats": coachStats[]{
    "value": ${loc("value")},
    "label": ${loc("label")}
  },
  "about": about {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "body": ${loc("body")},
    "bullets": bullets[]{ "v": coalesce(@[$locale], @.es, @) },
    image
  },
  "servicesSection": servicesSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "services": services[]{
    "title": ${loc("title")},
    "description": ${loc("description")},
    icon,
    image,
    "duration": ${loc("duration")},
    "price": ${loc("price")}
  },
  "objectivesSection": objectivesSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "objectives": objectives[]{
    icon,
    "title": ${loc("title")},
    "description": ${loc("description")}
  },
  "pricing": pricing {
    "enabled": coalesce(enabled, false),
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")},
    "modalities": modalities[]{
      id,
      "label": ${loc("label")}
    },
    "tiers": tiers[]{
      sessions,
      "label": ${loc("label")},
      "prices": prices[]{
        modalityId,
        amount,
        perSession
      }
    },
    "note": ${loc("note")}
  },
  "teamSection": teamSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "team": team[]{
    name,
    "role": ${loc("role")},
    "bio": ${loc("bio")},
    photo
  },
  "testimonialsSection": testimonialsSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")}
  },
  "testimonials": testimonials[]{
    "quote": ${loc("quote")},
    author,
    "context": ${loc("context")},
    photo
  },
  "instagramFeed": instagramFeed {
    "enabled": coalesce(enabled, false),
    handle,
    "ctaLabel": ${loc("ctaLabel")},
    "posts": posts[]{
      image,
      "caption": ${loc("caption")},
      postUrl
    }
  },
  "lifestyleGallery": lifestyleGallery[]{
    image,
    "alt": ${loc("alt")}
  },
  "contact": contact {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")},
    address,
    phone,
    email,
    "hours": hours[]{
      "label": ${loc("label")},
      "value": value
    },
    mapEmbedUrl,
    bookingUrl,
    "social": social[]{ name, url }
  },
  "chatbot": ${chatbotProjection(loc)}
}`;

type RawDemoSite = Omit<DemoSite, "about" | "chatbot"> & {
  about: (Omit<NonNullable<DemoSite["about"]>, "bullets"> & {
    bullets: { v: string }[] | null;
  }) | null;
  chatbot: RawChatbot | null;
};

export async function getDemoSiteBySlug(
  slug: string,
  locale: Locale
): Promise<DemoSite | null> {
  const raw = await client
    .fetch<RawDemoSite | null>(
      `*[_type == "demoSite" && slug.current == $slug][0] ${demoSiteProjection}`,
      { slug, locale }
    )
    .catch(() => null);

  if (!raw) return null;

  return {
    ...raw,
    services: raw.services ?? [],
    team: raw.team ?? [],
    testimonials: raw.testimonials ?? [],
    coachStats: raw.coachStats ?? [],
    objectives: raw.objectives ?? [],
    lifestyleGallery: raw.lifestyleGallery ?? [],
    pricing: raw.pricing
      ? {
          ...raw.pricing,
          modalities: raw.pricing.modalities ?? [],
          tiers: (raw.pricing.tiers ?? []).map((t) => ({
            ...t,
            prices: t.prices ?? [],
          })),
        }
      : null,
    instagramFeed: raw.instagramFeed
      ? {
          ...raw.instagramFeed,
          posts: raw.instagramFeed.posts ?? [],
        }
      : null,
    about: raw.about
      ? {
          ...raw.about,
          bullets: (raw.about.bullets ?? [])
            .map((b) => b.v)
            .filter(Boolean) as string[],
        }
      : null,
    contact: raw.contact
      ? {
          ...raw.contact,
          hours: raw.contact.hours ?? [],
          social: raw.contact.social ?? [],
        }
      : null,
    chatbot: normalizeChatbot(raw.chatbot),
  };
}

export async function getDemoSiteSlugs(): Promise<string[]> {
  return client
    .fetch<string[]>(
      `*[_type == "demoSite" && defined(slug.current)].slug.current`
    )
    .catch(() => []);
}

export async function getPublishedDemoSites(
  locale: Locale
): Promise<DemoSiteSummary[]> {
  return client
    .fetch<DemoSiteSummary[]>(
      `*[_type == "demoSite" && publishedToGallery == true]
        | order(coalesce(galleryOrder, 9999) asc) {
          "_id": _id,
          "slug": slug.current,
          template,
          "businessName": ${loc("businessName")},
          "tagline": ${loc("tagline")},
          "sector": ${loc("sector")},
          "shortDescription": ${loc("shortDescription")},
          thumbnail,
          galleryOrder
        }`,
      { locale }
    )
    .catch(() => []);
}

export async function getSiteSettingsFull(
  locale: Locale
): Promise<SiteSettingsFull> {
  type RawMeta = Omit<SiteSettingsMeta, "keywords"> & {
    keywords: { v: string }[] | null;
  };
  type Raw = {
    metadata: RawMeta;
    footer: SiteSettingsFooter | null;
  };

  const raw = await client
    .fetch<Raw | null>(
      `*[_type == "siteSettings"][0] {
        "metadata": metadata {
          "title": ${loc("title")},
          titleTemplate,
          "description": ${loc("description")},
          "ogDescription": ${loc("ogDescription")},
          "twitterDescription": ${loc("twitterDescription")},
          "keywords": keywords[]{ "v": coalesce(@[$locale], @.es, @) }
        },
        "footer": footer {
          "tagline": ${loc("tagline")},
          "availability": ${loc("availability")},
          email,
          "socialLinks": socialLinks[]{ name, url, external }
        }
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return DEFAULT_SITE_SETTINGS;

  return {
    metadata: {
      ...raw.metadata,
      keywords: (raw.metadata.keywords ?? []).map((k) => k.v).filter(Boolean),
    },
    footer: {
      tagline: raw.footer?.tagline ?? null,
      availability: raw.footer?.availability ?? null,
      email: raw.footer?.email ?? null,
      socialLinks: raw.footer?.socialLinks ?? [],
    },
  };
}


// =====================================================
// BLOG
// =====================================================

// Calcula minutos de lectura desde el número de caracteres del body en plano.
// Asume ~5 chars/palabra, ~225 palabras/min (estándar reading speed).
function calcReadingMinutes(bodyTextLength: number): number {
  if (bodyTextLength <= 0) return 1;
  return Math.max(1, Math.round(bodyTextLength / 5 / 225));
}

// Proyección compartida para items del listado de posts.
const postListProjection = `
  _id,
  "slug": slug.current,
  "title": ${loc("title")},
  "excerpt": ${loc("excerpt")},
  publishedAt,
  updatedAt,
  coverImage,
  "bodyTextLength": length(pt::text(coalesce(body, []))),
  "category": category->{
    "title": ${loc("title")},
    "slug": slug.current
  },
  "tags": tags[]->{
    "title": ${loc("title")},
    "slug": slug.current
  },
  "author": author->{
    name,
    "slug": slug.current,
    photo
  }
`;

type RawPostListItem = Omit<PostListItem, "readingMinutes" | "tags"> & {
  bodyTextLength: number;
  tags: { title: string; slug: string }[] | null;
};

function normalizePostListItem(raw: RawPostListItem): PostListItem {
  const { bodyTextLength, tags, ...rest } = raw;
  return {
    ...rest,
    tags: tags ?? [],
    readingMinutes: calcReadingMinutes(bodyTextLength),
  };
}

export async function getPosts(
  locale: Locale,
  options: {
    categorySlug?: string;
    tagSlug?: string;
    order?: "newest" | "oldest";
    limit?: number;
    offset?: number;
  } = {}
): Promise<PostListItem[]> {
  const { categorySlug, tagSlug, order = "newest", limit = 50, offset = 0 } =
    options;

  const filters = ['_type == "post"', "noindex != true"];
  if (categorySlug) filters.push("category->slug.current == $categorySlug");
  if (tagSlug) filters.push("$tagSlug in tags[]->slug.current");

  const direction = order === "newest" ? "desc" : "asc";
  const query = `*[${filters.join(" && ")}] | order(publishedAt ${direction}) [${offset}...${offset + limit}] {
    ${postListProjection}
  }`;

  const raw = await client
    .fetch<RawPostListItem[]>(query, { locale, categorySlug, tagSlug })
    .catch(() => [] as RawPostListItem[]);

  return raw.map(normalizePostListItem);
}

export async function getPostSlugs(): Promise<string[]> {
  const raw = await client
    .fetch<{ slug: string | null }[]>(
      `*[_type == "post" && noindex != true]{ "slug": slug.current }`
    )
    .catch(() => [] as { slug: string | null }[]);
  return raw.map((r) => r.slug).filter((s): s is string => Boolean(s));
}

export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<PostFull | null> {
  const params = { slug, locale };
  const raw = await client
    .fetch<
      | (RawPostListItem & {
          body: PostFull["body"] | null;
          seoTitle: string | null;
          seoDescription: string | null;
          ogImage: PostFull["ogImage"];
          noindex: boolean | null;
          authorFull: BlogAuthor | null;
          relatedPostsManual: RawPostListItem[] | null;
        })
      | null
    >(
      `*[_type == "post" && slug.current == $slug][0] {
        ${postListProjection},
        "body": coalesce(${locale === "en" ? "bodyEn" : "body"}, body),
        "seoTitle": ${loc("seoTitle")},
        "seoDescription": ${loc("seoDescription")},
        ogImage,
        noindex,
        "authorFull": author->{
          _id,
          name,
          "slug": slug.current,
          "jobTitle": ${loc("jobTitle")},
          "bioShort": ${loc("bioShort")},
          "bioLong": ${loc("bioLong")},
          email,
          photo,
          "social": social{
            linkedinUrl,
            githubUrl,
            twitterUrl,
            instagramUrl,
            websiteUrl
          }
        },
        "relatedPostsManual": relatedPosts[]->{ ${postListProjection} }
      }`,
      params
    )
    .catch(() => null);

  if (!raw) return null;

  const base = normalizePostListItem(raw);
  return {
    ...base,
    body: raw.body ?? [],
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    ogImage: raw.ogImage,
    noindex: raw.noindex ?? false,
    authorFull: raw.authorFull
      ? {
          ...raw.authorFull,
          social: raw.authorFull.social ?? {
            linkedinUrl: null,
            githubUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            websiteUrl: null,
          },
        }
      : null,
    relatedPostsManual: (raw.relatedPostsManual ?? []).map(normalizePostListItem),
  };
}

export async function getRelatedPostsAuto(
  postId: string,
  categorySlug: string | null,
  tagSlugs: string[],
  locale: Locale,
  limit = 3
): Promise<PostListItem[]> {
  // Heurística: posts en la misma categoría o que comparten al menos un tag,
  // excluyendo el actual. Ordenados por publishedAt desc.
  const raw = await client
    .fetch<RawPostListItem[]>(
      `*[
        _type == "post"
        && _id != $postId
        && noindex != true
        && (
          category->slug.current == $categorySlug
          || count((tags[]->slug.current)[@ in $tagSlugs]) > 0
        )
      ] | order(publishedAt desc) [0...$limit] {
        ${postListProjection}
      }`,
      { postId, categorySlug, tagSlugs, locale, limit }
    )
    .catch(() => [] as RawPostListItem[]);

  return raw.map(normalizePostListItem);
}

export async function getCategories(locale: Locale): Promise<BlogCategory[]> {
  return client
    .fetch<BlogCategory[]>(
      `*[_type == "blogCategory"] | order(order asc) {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")},
        "order": coalesce(order, 100)
      }`,
      { locale }
    )
    .catch(() => [] as BlogCategory[]);
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale
): Promise<BlogCategory | null> {
  return client
    .fetch<BlogCategory | null>(
      `*[_type == "blogCategory" && slug.current == $slug][0] {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")},
        "order": coalesce(order, 100)
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getTags(locale: Locale): Promise<BlogTag[]> {
  return client
    .fetch<BlogTag[]>(
      `*[_type == "blogTag"] | order(title.es asc) {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")}
      }`,
      { locale }
    )
    .catch(() => [] as BlogTag[]);
}

export async function getTagBySlug(
  slug: string,
  locale: Locale
): Promise<BlogTag | null> {
  return client
    .fetch<BlogTag | null>(
      `*[_type == "blogTag" && slug.current == $slug][0] {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")}
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getAuthorBySlug(
  slug: string,
  locale: Locale
): Promise<BlogAuthor | null> {
  return client
    .fetch<BlogAuthor | null>(
      `*[_type == "author" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        "jobTitle": ${loc("jobTitle")},
        "bioShort": ${loc("bioShort")},
        "bioLong": ${loc("bioLong")},
        email,
        photo,
        "social": coalesce(social, {})
      }`,
      { slug, locale }
    )
    .catch(() => null);
}
