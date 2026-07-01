import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getDemoSiteBySlug } from "@ebecerra/sanity-client";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import BeeMovementEquipoPage from "@/components/templates/beemovement/BeeMovementEquipoPage";

/**
 * Subpágina dedicada "Equipo" de la demo BeeMovement — solo resuelve para
 * esa demo (slug fijo). Cualquier otro slug → notFound. Sigue el mismo
 * patrón híbrido home one-page + subpágina que estrenó gestoría.
 */
const BEEMOVEMENT_SLUG = "beemovement";

export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, slug: BEEMOVEMENT_SLUG }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug !== BEEMOVEMENT_SLUG) return { robots: { index: false, follow: false } };
  const demo = await getDemoSiteBySlug(slug, locale as Locale);
  if (!demo) return { robots: { index: false, follow: false } };
  return {
    title: `Equipo · ${demo.businessName}`,
    description: "Conoce al equipo de Espacio BeeMovement.",
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function BeeMovementEquipoRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (slug !== BEEMOVEMENT_SLUG) notFound();

  const demo = await getDemoSiteBySlug(slug, locale as Locale);
  if (!demo || demo.template !== "beemovement") notFound();

  return <BeeMovementEquipoPage demo={demo} locale={locale as Locale} />;
}
