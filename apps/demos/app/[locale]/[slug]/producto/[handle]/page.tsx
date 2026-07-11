import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCommerce, PRODUCTS } from "@/components/templates/tienda/commerce";
import { tiendaContent } from "@/components/templates/tienda/content";
import TiendaChrome from "@/components/templates/tienda/TiendaChrome";
import ProductDetail from "@/components/templates/tienda/ProductDetail";
import DemoBanner from "../../DemoBanner";

const TIENDA_SLUG = "la-cesta";

export const revalidate = 60;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRODUCTS.map((p) => ({ locale, slug: TIENDA_SLUG, handle: p.handle }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; handle: string }>;
}): Promise<Metadata> {
  const { slug, handle } = await params;
  if (slug !== TIENDA_SLUG) return { robots: { index: false, follow: false } };
  const product = await getCommerce().getProduct(handle);
  return {
    title: product
      ? `${product.title} · ${tiendaContent.brand.name}`
      : tiendaContent.brand.name,
    description: product?.description,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function ProductRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string; handle: string }>;
}) {
  const { locale, slug, handle } = await params;
  if (slug !== TIENDA_SLUG) notFound();
  setRequestLocale(locale);

  const commerce = getCommerce();
  const product = await commerce.getProduct(handle);
  if (!product) notFound();

  const [categories, related] = await Promise.all([
    commerce.listCategories(),
    commerce.listProducts({
      category_handle: product.categories[0]?.handle,
      limit: 5,
    }),
  ]);

  return (
    <>
      <DemoBanner template="tienda" />
      <TiendaChrome categories={categories}>
        <ProductDetail
          content={tiendaContent}
          product={product}
          related={related.products.filter((p) => p.id !== product.id).slice(0, 4)}
        />
      </TiendaChrome>
    </>
  );
}
