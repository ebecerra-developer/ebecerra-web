import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCommerce } from "@/components/templates/tienda/commerce";
import { tiendaContent } from "@/components/templates/tienda/content";
import TiendaChrome from "@/components/templates/tienda/TiendaChrome";
import CheckoutView from "@/components/templates/tienda/CheckoutView";
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
    title: `${tiendaContent.checkout.title} · ${tiendaContent.brand.name}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function CheckoutRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (slug !== TIENDA_SLUG) notFound();
  setRequestLocale(locale);

  const categories = await getCommerce().listCategories();

  return (
    <>
      <DemoBanner template="tienda" />
      <TiendaChrome categories={categories}>
        <CheckoutView content={tiendaContent} />
      </TiendaChrome>
    </>
  );
}
