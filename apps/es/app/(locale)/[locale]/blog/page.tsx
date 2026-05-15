import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import BlogIntro from "@/components/blog/BlogIntro";
import PostCard from "@/components/blog/PostCard";
import { getPosts } from "@ebecerra/sanity-client";
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

  const posts = await getPosts(locale);

  return (
    <>
      <Nav />
      <main id="main" className={styles.shell}>
        <BlogIntro
          kicker={t("kicker")}
          title={t("title")}
          lead={t("lead")}
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
