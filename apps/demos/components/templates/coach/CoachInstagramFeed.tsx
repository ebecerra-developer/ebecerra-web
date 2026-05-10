import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./CoachInstagramFeed.module.css";

/**
 * Mosaico tipo "feed Instagram" (referencia: llaullau-web Feed.tsx).
 * Imágenes subidas a Sanity (no API real para evitar tokens y rate limits).
 * Render condicional vía instagramFeed.enabled.
 */
export default function CoachInstagramFeed({ demo }: { demo: DemoSite }) {
  const feed = demo.instagramFeed;
  if (!feed?.enabled) return null;
  if (feed.posts.length === 0) return null;

  const handle = feed.handle?.replace(/^@/, "") ?? null;
  const ctaLabel = feed.ctaLabel ?? (handle ? `@${handle} en Instagram` : null);
  const profileUrl = handle ? `https://www.instagram.com/${handle}/` : null;

  return (
    <section
      className={styles.section}
      aria-labelledby="instagram-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 id="instagram-heading" className={styles.title}>
            {handle ? `@${handle}` : "Instagram"}
          </h2>
        </header>

        <ul className={styles.grid}>
          {feed.posts.slice(0, 6).map((post, i) => {
            const src = urlFor(post.image)
              .width(800)
              .height(800)
              .auto("format")
              .url();
            const inner = (
              <>
                <Image
                  src={src}
                  alt={post.caption ?? ""}
                  fill
                  sizes="(min-width: 1000px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className={styles.image}
                />
                {post.caption && (
                  <span className={styles.overlay}>
                    <span className={styles.caption}>{post.caption}</span>
                  </span>
                )}
              </>
            );
            return (
              <li key={i} className={styles.item}>
                {post.postUrl ? (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={styles.link}>{inner}</div>
                )}
              </li>
            );
          })}
        </ul>

        {ctaLabel && profileUrl && (
          <p className={styles.cta}>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              {ctaLabel} ↗
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
