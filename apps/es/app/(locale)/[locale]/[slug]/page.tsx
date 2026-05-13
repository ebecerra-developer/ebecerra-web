import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import LegalContent from "@/components/legal/LegalContent";
import { getLegalPage, getLegalPageSlugs } from "@ebecerra/sanity-client";

export const revalidate = 86400;

export async function generateStaticParams() {
  const slugs = await getLegalPageSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getLegalPage(slug, locale);
  if (!page) return {};
  const canonical = locale === "es" ? `/${slug}/` : `/en/${slug}/`;
  return {
    title: page.title,
    description: page.metaDescription ?? undefined,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, l === "es" ? `/${slug}/` : `/en/${slug}/`])
      ),
    },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const page = await getLegalPage(slug, locale);
  if (!page) notFound();

  return (
    <>
      <Nav />
      <main id="main">
        <LegalContent
          title={page.title}
          updatedAt={page.updatedAt}
          content={page.content}
          locale={locale}
        />
      </main>
      <Footer />
    </>
  );
}
