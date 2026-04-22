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
  Locale,
} from "./types";

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
