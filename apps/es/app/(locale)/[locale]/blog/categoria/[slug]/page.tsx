import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import BlogIntro from "@/components/blog/BlogIntro";
import BlogFilters from "@/components/blog/BlogFilters";
import PostCard from "@/components/blog/PostCard";
import {
  getPosts,
  getCategoryBySlug,
  getCategories,
} from "@ebecerra/sanity-client";
import styles from "../../Blog.module.css";

export const revalidate = 1800;

type Sort = "newest" | "oldest";
function isSort(value: string | undefined): value is Sort {
  return value === "newest" || value === "oldest";
}

export async function generateStaticParams() {
  const categories = await getCategories("es");
  return routing.locales.flatMap((locale) =>
    categories.map((c) => ({ locale, slug: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const category = await getCategoryBySlug(slug, locale);
  if (!category) return {};

  const canonical =
    locale === "es"
      ? `/blog/categoria/${slug}/`
      : `/${locale}/blog/categoria/${slug}/`;
  const title = `${category.title} · ${t("title")}`;
  const description =
    category.description ?? `${t("title")} · ${category.title}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: `/blog/categoria/${slug}/`,
        en: `/en/blog/categoria/${slug}/`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });

  const sp = await searchParams;
  const order: Sort = isSort(sp.sort) ? sp.sort : "newest";

  const [category, posts, categories] = await Promise.all([
    getCategoryBySlug(slug, locale),
    getPosts(locale, { categorySlug: slug, order }),
    getCategories(locale),
  ]);

  if (!category) notFound();

  return (
    <>
      <Nav />
      <main id="main" className={styles.shell}>
        <BlogIntro
          kicker={`// ${t("filterCategory").toLowerCase()}`}
          title={category.title}
          lead={category.description ?? ""}
        />

        <BlogFilters
          categories={categories}
          selectedCategory={category.slug}
          order={order}
          fixedScope="category"
        />

        {posts.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
