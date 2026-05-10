import Image from "next/image";
import type { DemoInstagramFeed } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./VibrantInstagramFeed.module.css";

/**
 * Feed Instagram tipo collage asimétrico (no grid 3x2 ordenado).
 * Cada post con tamaño y rotación distinta. Hover lift + caption overlay.
 * Sticker handle pinned arriba como elemento de marca.
 */
export default function VibrantInstagramFeed({
  feed,
}: {
  feed: DemoInstagramFeed;
}) {
  if (feed.posts.length === 0) return null;
  const handle = feed.handle?.replace(/^@/, "") ?? null;
  const profileUrl = handle ? `https://www.instagram.com/${handle}/` : null;
  const ctaLabel = feed.ctaLabel ?? (handle ? `Ir a @${handle}` : "Ver más");
  const items = feed.posts.slice(0, 6);

  return (
    <section
      id="instagram"
      className={styles.section}
      aria-labelledby="ig-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.tag}>Instagram</span>
          <h2 id="ig-heading" className={styles.title}>
            {handle ? `@${handle}` : "En redes"}
          </h2>
          <p className={styles.sub}>Lo que comparto a diario, sin filtros raros.</p>
        </header>

        <div className={styles.collage}>
          {items.map((post, i) => {
            const url = urlFor(post.image)
              .width(800)
              .height(800)
              .auto("format")
              .url();
            const inner = (
              <>
                <Image
                  src={url}
                  alt={post.caption ?? ""}
                  fill
                  sizes="(min-width: 1000px) 33vw, 50vw"
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
              <div key={i} className={`${styles.cell} ${styles[`cell${i % 6}`]}`}>
                {post.postUrl ? (
                  <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                    {inner}
                  </a>
                ) : (
                  <div className={styles.link}>{inner}</div>
                )}
              </div>
            );
          })}
        </div>

        {profileUrl && (
          <p className={styles.cta}>
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaLink}>
              {ctaLabel} ↗
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
