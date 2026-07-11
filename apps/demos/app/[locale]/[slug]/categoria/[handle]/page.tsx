import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
  getCommerce,
  CATEGORIES,
} from "@/components/templates/tienda/commerce";
import { tiendaContent } from "@/components/templates/tienda/content";
import TiendaChrome from "@/components/templates/tienda/TiendaChrome";
import CategoryView from "@/components/templates/tienda/CategoryView";
import DemoBanner from "../../DemoBanner";

/** Listado de categoría de la demo tienda (slug fijo). Otros slugs → notFound. */
const TIENDA_SLUG = "la-cesta";

export const revalidate = 60;

export function generateStaticParams() {
  const handles = [...CATEGORIES.map((c) => c.handle), "todos", "ofertas"];
  return routing.locales.flatMap((locale) =>
    handles.map((handle) => ({ locale, slug: TIENDA_SLUG, handle }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; handle: string }>;
}): Promise<Metadata> {
  const { slug, handle } = await params;
  if (slug !== TIENDA_SLUG) return { robots: { index: false, follow: false } };
  const cat = CATEGORIES.find((c) => c.handle === handle);
  const title =
    handle === "ofertas"
      ? tiendaContent.category.offersTitle
      : handle === "todos"
        ? tiendaContent.category.allTitle
        : (cat?.name ?? "");
  return {
    title: `${title} · ${tiendaContent.brand.name}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function CategoryRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string; handle: string }>;
}) {
  const { locale, slug, handle } = await params;
  if (slug !== TIENDA_SLUG) notFound();
  setRequestLocale(locale);

  const commerce = getCommerce();
  const content = tiendaContent;
  const categories = await commerce.listCategories();

  let title: string;
  let products;
  if (handle === "ofertas") {
    title = content.category.offersTitle;
    products = (await commerce.listProducts({ on_sale: true })).products;
  } else if (handle === "todos") {
    title = content.category.allTitle;
    products = (await commerce.listProducts()).products;
  } else {
    const cat = categories.find((c) => c.handle === handle);
    if (!cat) notFound();
    title = cat.name;
    products = (await commerce.listProducts({ category_handle: handle }))
      .products;
  }

  return (
    <>
      <DemoBanner template="tienda" />
      <TiendaChrome categories={categories}>
        <CategoryView
          content={content}
          categories={categories}
          activeHandle={handle}
          title={title}
          products={products}
        />
      </TiendaChrome>
    </>
  );
}
