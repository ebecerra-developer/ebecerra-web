import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  getLegalPageSlugs,
  getPostSlugs,
  getCategories,
  getTags,
} from "@ebecerra/sanity-client";

const SITE_URL = "https://ebecerra.es";

// trailingSlash: true en next.config → todas las URLs canónicas terminan con "/".
function localizedUrl(locale: (typeof routing.locales)[number], path: string = ""): string {
  const base = locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`;
  const full = path ? `${base}${path}` : base;
  return full.endsWith("/") ? full : `${full}/`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
    { path: "/ejemplos", priority: 0.7, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.9, changeFrequency: "weekly" },
  ];

  const staticEntries = staticRoutes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: locale === routing.defaultLocale ? route.priority : route.priority - 0.1,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, localizedUrl(l, route.path)])
        ),
      },
    }))
  );

  const legalSlugs = await getLegalPageSlugs();
  const legalEntries = legalSlugs.flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, `/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: locale === routing.defaultLocale ? 0.5 : 0.4,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, localizedUrl(l, `/${slug}`)])
        ),
      },
    }))
  );

  // Blog posts
  const postSlugs = await getPostSlugs();
  const postEntries = postSlugs.flatMap((slug) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, `/blog/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: locale === routing.defaultLocale ? 0.7 : 0.6,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, localizedUrl(l, `/blog/${slug}`)])
        ),
      },
    }))
  );

  // Categorías + tags del blog
  const [categories, tags] = await Promise.all([
    getCategories("es"),
    getTags("es"),
  ]);
  const taxonomyEntries = [
    ...categories.map((c) => ({ path: `/blog/categoria/${c.slug}` })),
    ...tags.map((t) => ({ path: `/blog/tag/${t.slug}` })),
  ].flatMap(({ path }) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: locale === routing.defaultLocale ? 0.5 : 0.4,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, localizedUrl(l, path)])
        ),
      },
    }))
  );

  return [...staticEntries, ...legalEntries, ...postEntries, ...taxonomyEntries];
}
