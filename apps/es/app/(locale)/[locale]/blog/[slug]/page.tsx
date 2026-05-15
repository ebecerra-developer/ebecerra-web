import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PostMeta from "@/components/blog/PostMeta";
import PortableContent from "@/components/blog/PortableContent";
import { getPostBySlug, getPostSlugs } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import styles from "../Blog.module.css";

export const revalidate = 1800;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug, locale);
  if (!post) return {};

  const canonical =
    locale === "es" ? `/blog/${slug}/` : `/${locale}/blog/${slug}/`;
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  const ogImage =
    post.ogImage && post.ogImage.asset
      ? urlFor(post.ogImage).width(1200).height(630).fit("crop").auto("format").url()
      : post.coverImage && post.coverImage.asset
        ? urlFor(post.coverImage).width(1200).height(630).fit("crop").auto("format").url()
        : null;

  return {
    title,
    description,
    robots: post.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        es: `/blog/${slug}/`,
        en: `/en/blog/${slug}/`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: canonical,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? undefined,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "blog" });

  const post = await getPostBySlug(slug, locale);
  if (!post) notFound();

  const cover =
    post.coverImage && post.coverImage.asset
      ? urlFor(post.coverImage).width(1280).height(720).fit("crop").auto("format").url()
      : null;

  const blogHref = locale === "es" ? "/blog/" : `/${locale}/blog/`;
  const categoryHref = post.category
    ? locale === "es"
      ? `/blog/categoria/${post.category.slug}/`
      : `/${locale}/blog/categoria/${post.category.slug}/`
    : null;
  const tagHref = (slug: string) =>
    locale === "es" ? `/blog/tag/${slug}/` : `/${locale}/blog/tag/${slug}/`;

  return (
    <>
      <Nav />
      <main id="main" className={styles.postShell}>
        <Link href={blogHref} className={styles.backLink}>
          {t("backToList")}
        </Link>

        <header className={styles.postHeader}>
          {post.category && categoryHref && (
            <Link href={categoryHref} className={styles.postCategory}>
              {post.category.title}
            </Link>
          )}
          <h1 className={styles.postTitle}>{post.title}</h1>
          <p className={styles.postExcerpt}>{post.excerpt}</p>
          <PostMeta
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            readingMinutes={post.readingMinutes}
            authorName={post.author?.name ?? null}
            locale={locale}
          />
        </header>

        {cover && (
          <div className={styles.postCover}>
            <Image
              src={cover}
              alt={post.coverImage?.alt ?? ""}
              width={1280}
              height={720}
              priority
              sizes="(min-width: 800px) 720px, 100vw"
            />
          </div>
        )}

        <PortableContent blocks={post.body} />

        {post.tags.length > 0 && (
          <div className={styles.postTags}>
            {post.tags.map((tag) => (
              <Link key={tag.slug} href={tagHref(tag.slug)} className={styles.postTag}>
                #{tag.title}
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
