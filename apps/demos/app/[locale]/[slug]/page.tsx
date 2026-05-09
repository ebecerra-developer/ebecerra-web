import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getDemoSiteBySlug, getDemoSiteSlugs } from "@ebecerra/sanity-client";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import FisioTemplate from "@/components/templates/fisio/FisioTemplate";
import DemoBanner from "./DemoBanner";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getDemoSiteSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const demo = await getDemoSiteBySlug(slug, locale as Locale);
  if (!demo) return { robots: { index: false, follow: false } };

  return {
    title: demo.businessName,
    description: demo.tagline ?? undefined,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const demo = await getDemoSiteBySlug(slug, locale as Locale);
  if (!demo) notFound();

  return (
    <>
      <DemoBanner />
      {demo.template === "fisio" ? (
        <FisioTemplate demo={demo} locale={locale as Locale} />
      ) : (
        <main id="main" style={{ padding: "4rem 1.5rem", textAlign: "center" }}>
          <p>
            Plantilla <code>{demo.template}</code> aún no implementada.
          </p>
        </main>
      )}
    </>
  );
}
