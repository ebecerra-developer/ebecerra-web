import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getSectorLanding } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import SectorLanding from "@/components/sections/SectorLanding";

export const revalidate = 1800;

const SITE_URL = "https://ebecerra.es";
const SLUG = "pagina-web-para-gestorias";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const data = await getSectorLanding(SLUG, locale as Locale);
  if (!data) return {};

  const canonical =
    locale === "es"
      ? `${SITE_URL}/${SLUG}/`
      : `${SITE_URL}/${locale}/${SLUG}/`;

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}/${SLUG}/`,
        en: `${SITE_URL}/en/${SLUG}/`,
        "x-default": `${SITE_URL}/${SLUG}/`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export default async function DisenoWebGestoriasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const data = await getSectorLanding(SLUG, locale as Locale);
  if (!data) notFound();

  return (
    <>
      <Nav />
      <SectorLanding data={data} locale={locale as Locale} />
      <Footer />
    </>
  );
}
