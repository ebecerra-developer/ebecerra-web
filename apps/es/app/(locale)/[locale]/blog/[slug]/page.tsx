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
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import AuthorBio from "@/components/blog/AuthorBio";
import RelatedPosts from "@/components/blog/RelatedPosts";
import PostJsonLd from "@/components/blog/PostJsonLd";
import RoughActivator from "@/components/blog/RoughActivator";
import PostCoverFallback from "@/components/blog/PostCoverFallback";
import PostLikes from "@/components/blog/PostLikes";
import CommentForm from "@/components/blog/CommentForm";
import CommentList, {
  type ApprovedComment,
} from "@/components/blog/CommentList";
import { highlightCodeBlocks } from "@/lib/highlight";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getPostBySlug,
  getPostSlugs,
  getRelatedPostsAuto,
} from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import styles from "../Blog.module.css";

const SITE_URL = "https://ebecerra.es";

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

  // Pre-highlight de codeBlocks con Shiki — server-side, en build (ISR).
  // Los demás bloques pasan tal cual; PortableContent lee highlightedHtml si existe.
  const highlightedBody = await highlightCodeBlocks(
    post.body as { _type?: string }[]
  );

  // Posts relacionados: si el editor definió manualmente, usarlos. Si no,
  // calcular automáticamente por categoría/tags compartidos.
  const related =
    post.relatedPostsManual.length > 0
      ? post.relatedPostsManual
      : await getRelatedPostsAuto(
          post._id,
          post.category?.slug ?? null,
          post.tags.map((t) => t.slug),
          locale,
          3
        );

  const absoluteUrl =
    locale === "es"
      ? `${SITE_URL}/blog/${slug}/`
      : `${SITE_URL}/${locale}/blog/${slug}/`;

  // Likes count + comentarios aprobados — admin client porque ambas tablas
  // están limitadas a server por RLS (chatbot_messages style).
  const supabaseAdmin = createSupabaseAdminClient();
  const [likeRow, commentsRows] = await Promise.all([
    supabaseAdmin
      .from("post_likes")
      .select("count")
      .eq("post_slug", slug)
      .maybeSingle(),
    supabaseAdmin
      .from("post_comments")
      .select("id, author_name, body, created_at")
      .eq("post_slug", slug)
      .eq("status", "approved")
      .order("created_at", { ascending: true }),
  ]);
  const likeCount: number = likeRow.data?.count ?? 0;
  const approvedComments: ApprovedComment[] = (commentsRows.data ?? []).map(
    (c) => ({
      id: c.id,
      authorName: c.author_name,
      body: c.body,
      createdAt: c.created_at,
    })
  );

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
      <PostJsonLd post={post} url={absoluteUrl} />
      <RoughActivator rootSelector="[data-blog-post]" />
      <Nav />
      <main id="main" className={styles.postShell}>
        <Link href={blogHref} className={styles.backLink}>
          {t("backToList")}
        </Link>

        <div className={styles.postLayout}>
          <article className={styles.postBody} data-blog-post>
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

            <div className={styles.postCover}>
              {cover ? (
                <Image
                  src={cover}
                  alt={post.coverImage?.alt ?? ""}
                  width={1280}
                  height={720}
                  priority
                  sizes="(min-width: 1100px) 1100px, 100vw"
                />
              ) : (
                <PostCoverFallback variant="hero" />
              )}
            </div>

            <TableOfContents blocks={post.body} label={t("tocLabel")} />

            <PortableContent blocks={highlightedBody} />

            {post.tags.length > 0 && (
              <div className={styles.postTags}>
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={tagHref(tag.slug)}
                    className={styles.postTag}
                  >
                    #{tag.title}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons
              url={absoluteUrl}
              title={post.title}
              label={t("shareLabel")}
            />

            <div className={styles.likesRow}>
              <PostLikes
                slug={slug}
                initialCount={likeCount}
                label={t("likeLabel")}
                thanksLabel={t("likeThanks")}
              />
            </div>

            {post.authorFull && (
              <AuthorBio author={post.authorFull} byLabel={t("byPrefix")} />
            )}

            <section className={styles.commentsSection} aria-labelledby="comments-heading">
              <h2 id="comments-heading" className={styles.commentsHeading}>
                {t("commentsHeading")}
              </h2>
              <CommentList
                comments={approvedComments}
                locale={locale}
                emptyLabel={t("commentsEmpty")}
                countLabel={(n) => t("commentsCount", { count: n })}
              />
              <CommentForm
                postSlug={slug}
                labels={{
                  title: t("commentFormTitle"),
                  name: t("commentFormName"),
                  email: t("commentFormEmail"),
                  emailHint: t("commentFormEmailHint"),
                  body: t("commentFormBody"),
                  submit: t("commentFormSubmit"),
                  submitting: t("commentFormSubmitting"),
                  success: t("commentFormSuccess"),
                  error: t("commentFormError"),
                  privacyNote: t("commentFormPrivacy"),
                }}
              />
            </section>
          </article>
        </div>

        <RelatedPosts
          posts={related}
          locale={locale}
          label={t("relatedHeading")}
        />
      </main>
      <Footer />
    </>
  );
}
