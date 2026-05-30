import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import CategoryPills from "@/components/blog/CategoryPills";
import PostRow from "@/components/blog/PostRow";
import {
  getPosts,
  getTagBySlug,
  getTags,
  getCategories,
  getBlogPage,
} from "@ebecerra/sanity-client";
import styles from "../../Blog.module.css";

export const revalidate = 1800;

export async function generateStaticParams() {
  const tags = await getTags("es");
  return routing.locales.flatMap((locale) =>
    tags.map((t) => ({ locale, slug: t.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const blogPage = await getBlogPage(locale);
  const tag = await getTagBySlug(slug, locale);
  if (!tag) return {};

  const canonical =
    locale === "es" ? `/blog/tag/${slug}/` : `/${locale}/blog/tag/${slug}/`;
  const title = `#${tag.title} · ${blogPage.title}`;
  const description = tag.description ?? `${blogPage.title} · ${tag.title}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: `/blog/tag/${slug}/`,
        en: `/en/blog/tag/${slug}/`,
      },
    },
    openGraph: { title, description, type: "website", url: canonical },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [blogPage, tag, posts, categories] = await Promise.all([
    getBlogPage(locale),
    getTagBySlug(slug, locale),
    getPosts(locale, { tagSlug: slug, order: "newest" }),
    getCategories(locale),
  ]);

  if (!tag) notFound();

  return (
    <>
      <Nav />
      <main id="main" className={styles.shell}>
        <PageHero
          breadcrumbs={[
            { label: locale === "es" ? "Inicio" : "Home", href: locale === "es" ? "/" : `/${locale}/` },
            { label: "Blog", href: locale === "es" ? "/blog/" : `/${locale}/blog/` },
            { label: `#${tag.title}` },
          ]}
          kicker="// TAG"
          title={`#${tag.title}`}
          lead={tag.description ?? ""}
        />

        <CategoryPills
          categories={categories}
          selectedSlug={null}
          locale={locale}
        />

        {posts.length === 0 ? (
          <p className={styles.empty}>{blogPage.empty}</p>
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
