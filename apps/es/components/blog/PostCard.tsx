import Link from "next/link";
import Image from "next/image";
import type { PostListItem } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/sanity-image";
import PostMeta from "./PostMeta";
import PostCoverFallback from "./PostCoverFallback";
import styles from "./PostCard.module.css";

type Props = {
  post: PostListItem;
  locale: Locale;
};

const blogPath = (locale: Locale, slug: string) =>
  locale === "es" ? `/blog/${slug}/` : `/${locale}/blog/${slug}/`;

export default function PostCard({ post, locale }: Props) {
  const href = blogPath(locale, post.slug);
  const cover =
    post.coverImage && post.coverImage.asset
      ? urlFor(post.coverImage).width(720).height(420).fit("crop").auto("format").url()
      : null;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.coverLink} aria-hidden tabIndex={-1}>
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={720}
            height={420}
            sizes="(min-width: 900px) 360px, 100vw"
            className={styles.cover}
          />
        ) : (
          <PostCoverFallback
            variant="card"
            title={post.title}
            category={post.category?.title ?? null}
          />
        )}
      </Link>
      <div className={styles.body}>
        {post.category && (
          <Link
            href={
              locale === "es"
                ? `/blog/categoria/${post.category.slug}/`
                : `/${locale}/blog/categoria/${post.category.slug}/`
            }
            className={styles.category}
          >
            {post.category.title}
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
    </article>
  );
}
