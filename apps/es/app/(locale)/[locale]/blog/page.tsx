import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import PostRow from "@/components/blog/PostRow";
import CategoryPills from "@/components/blog/CategoryPills";
import { getPosts, getCategories } from "@ebecerra/sanity-client";
import styles from "./Blog.module.css";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const canonical = locale === "es" ? "/blog/" : "/en/blog/";

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: "/blog/",
        en: "/en/blog/",
      },
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
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
  const t = await getTranslations({ locale, namespace: "blog" });

  const [posts, categories] = await Promise.all([
    getPosts(locale, { order: "newest" }),
    getCategories(locale),
  ]);

  return (
    <>
      <Nav />
      <main id="main" className={styles.shell}>
        <PageHero
          kicker={t("kicker")}
          title={t("title")}
          lead={t("lead")}
        />

        <CategoryPills
          categories={categories}
          selectedSlug={null}
          locale={locale}
        />

        {posts.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
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
