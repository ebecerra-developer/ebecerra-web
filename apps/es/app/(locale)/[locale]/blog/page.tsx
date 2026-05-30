import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import PostRow from "@/components/blog/PostRow";
import CategoryPills from "@/components/blog/CategoryPills";
import {
  getPosts,
  getCategories,
  getBlogPage,
} from "@ebecerra/sanity-client";
import styles from "./Blog.module.css";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getBlogPage(locale);
  const canonical = locale === "es" ? "/blog/" : "/en/blog/";

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: "/blog/",
        en: "/en/blog/",
      },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: canonical,
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [page, posts, categories] = await Promise.all([
    getBlogPage(locale),
    getPosts(locale, { order: "newest" }),
    getCategories(locale),
  ]);

  return (
    <>
      <Nav />
      <main id="main" className={styles.shell}>
        <PageHero
          breadcrumbs={[
            { label: locale === "es" ? "Inicio" : "Home", href: locale === "es" ? "/" : `/${locale}/` },
            { label: locale === "es" ? "Blog" : "Blog" },
          ]}
          kicker={page.kicker}
          title={page.title}
          lead={page.lead}
        />

        <CategoryPills
          categories={categories}
          selectedSlug={null}
          locale={locale}
        />

        {posts.length === 0 ? (
          <p className={styles.empty}>{page.empty}</p>
        ) : (
          <div className={styles.rows}>
            {posts.map((post) => (
              <PostRow key={post._id} post={post} locale={locale} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
