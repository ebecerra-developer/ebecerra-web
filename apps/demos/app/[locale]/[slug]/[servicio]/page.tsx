import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import {
  getGestoriaContent,
  SERVICE_SLUGS,
  type ServiceSlug,
} from "@/components/templates/gestoria/content";
import GestoriaServicePage from "@/components/templates/gestoria/GestoriaServicePage";
import DemoBanner from "../DemoBanner";

/**
 * Subpáginas de servicio de la demo gestoría (híbrido: home one-page +
 * subpáginas). El segmento [servicio] vive bajo [slug] y SOLO resuelve para la
 * demo gestoría (slug fijo) y sus servicios; cualquier otra combinación →
 * notFound. Demos llevan noindex global.
 */
const GESTORIA_SLUG = "vega-asociados";

export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((servicio) => ({
      locale,
      slug: GESTORIA_SLUG,
      servicio,
    }))
  );
}

function resolve(slug: string, servicio: string): ServiceSlug | null {
  if (slug !== GESTORIA_SLUG) return null;
  return SERVICE_SLUGS.includes(servicio as ServiceSlug)
    ? (servicio as ServiceSlug)
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; servicio: string }>;
}): Promise<Metadata> {
  const { locale, slug, servicio } = await params;
  const key = resolve(slug, servicio);
  if (!key) return { robots: { index: false, follow: false } };
  const content = getGestoriaContent(locale as Locale);
  const detail = content.services_detail[key];
  return {
    title: `${detail.title} · ${content.brand.name}`,
    description: detail.lead,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function GestoriaServiceRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string; servicio: string }>;
}) {
  const { locale, slug, servicio } = await params;
  setRequestLocale(locale);

  const key = resolve(slug, servicio);
  if (!key) notFound();

  const content = getGestoriaContent(locale as Locale);
  const detail = content.services_detail[key];

  return (
    <>
      <DemoBanner template="gestoria" />
      <GestoriaServicePage
        content={content}
        locale={locale as Locale}
        detail={detail}
      />
    </>
  );
}
