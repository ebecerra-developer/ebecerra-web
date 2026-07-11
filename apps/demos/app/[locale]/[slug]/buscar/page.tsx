import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCommerce } from "@/components/templates/tienda/commerce";
import { tiendaContent } from "@/components/templates/tienda/content";
import TiendaChrome from "@/components/templates/tienda/TiendaChrome";
import SearchView from "@/components/templates/tienda/SearchView";
import DemoBanner from "../DemoBanner";

const TIENDA_SLUG = "la-cesta";

export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, slug: TIENDA_SLUG }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== TIENDA_SLUG) return { robots: { index: false, follow: false } };
  return {
    title: `${tiendaContent.search.title} · ${tiendaContent.brand.name}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function SearchRoute({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale, slug } = await params;
  if (slug !== TIENDA_SLUG) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const commerce = getCommerce();
  const categories = await commerce.listCategories();
  const results = q.trim()
    ? (await commerce.listProducts({ q })).products
    : [];

  return (
    <>
      <DemoBanner template="tienda" />
      <TiendaChrome categories={categories}>
        <SearchView content={tiendaContent} query={q} results={results} />
      </TiendaChrome>
    </>
  );
}
