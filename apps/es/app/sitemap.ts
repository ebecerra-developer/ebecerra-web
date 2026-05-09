import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLegalPageSlugs } from "@ebecerra/sanity-client";

const SITE_URL = "https://ebecerra.es";

function localizedUrl(locale: (typeof routing.locales)[number], path: string = ""): string {
  const base = locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`;
  return path ? `${base}${path}` : base;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
    { path: "/ejemplos", priority: 0.7, changeFrequency: "monthly" },
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

  return [...staticEntries, ...legalEntries];
}
