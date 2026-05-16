import Link from "next/link";
import Image from "next/image";
import type { PostListItem } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/sanity-image";
import PostMeta from "./PostMeta";
import PostCoverFallback from "./PostCoverFallback";
import styles from "./PostRow.module.css";

type Props = {
  post: PostListItem;
  locale: Locale;
};

const blogPath = (locale: Locale, slug: string) =>
  locale === "es" ? `/blog/${slug}/` : `/${locale}/blog/${slug}/`;

const categoryPath = (locale: Locale, slug: string) =>
  locale === "es" ? `/blog/categoria/${slug}/` : `/${locale}/blog/categoria/${slug}/`;

export default function PostRow({ post, locale }: Props) {
  const href = blogPath(locale, post.slug);
  const cover =
    post.coverImage && post.coverImage.asset
      ? urlFor(post.coverImage).width(560).height(320).fit("crop").auto("format").url()
      : null;

  return (
    <article className={styles.row}>
      <div className={styles.body}>
        {post.category && (
          <Link href={categoryPath(locale, post.category.slug)} className={styles.category}>
            // {post.category.title.toUpperCase()}
          </Link>
        )}
        <h2 className={styles.title}>
          <Link href={href}>{post.title}</Link>
        </h2>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <PostMeta
          publishedAt={post.publishedAt}
          updatedAt={post.updatedAt}
          readingMinutes={post.readingMinutes}
          authorName={post.author?.name ?? null}
          locale={locale}
        />
      </div>
      <Link href={href} className={styles.coverLink} aria-hidden tabIndex={-1}>
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={560}
            height={320}
            sizes="(min-width: 720px) 280px, 100vw"
            className={styles.cover}
          />
        ) : (
          <PostCoverFallback variant="card" />
        )}
      </Link>
    </article>
  );
}
