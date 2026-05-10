import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./VibrantHero.module.css";

/**
 * Hero vibrant: tipografía bold gigante con palabra outline / colored,
 * elementos decorativos sticker (blob magenta + verde ácido + lila),
 * imagen circular o redondeada pronunciada.
 */
export default function VibrantHero({ demo }: { demo: DemoSite }) {
  const hero = demo.hero;
  if (!hero?.heading) return null;

  const heroImageUrl = hero.image
    ? urlFor(hero.image).width(1200).height(1200).auto("format").url()
    : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {/* Stickers decorativos */}
      <span className={`${styles.sticker} ${styles.stickerMagenta}`} aria-hidden="true" />
      <span className={`${styles.sticker} ${styles.stickerLilac}`} aria-hidden="true" />
      <span className={`${styles.sticker} ${styles.stickerAcid}`} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.text}>
          {hero.kicker && (
            <p className={styles.kicker}>
              <span className={styles.kickerDot} aria-hidden="true" />
              {hero.kicker}
            </p>
          )}
          <h1 id="hero-heading" className={styles.heading}>
            {hero.heading}
          </h1>
          {hero.sub && <p className={styles.sub}>{hero.sub}</p>}
          <div className={styles.actions}>
            {hero.ctaPrimary?.label && (
              <a
                href={hero.ctaPrimary.href ?? "#contacto"}
                className={styles.ctaPrimary}
                target={hero.ctaPrimary.href?.startsWith("http") ? "_blank" : undefined}
                rel={hero.ctaPrimary.href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {hero.ctaPrimary.label}
              </a>
            )}
            {hero.ctaSecondary?.label && (
              <a href={hero.ctaSecondary.href ?? "#servicios"} className={styles.ctaSecondary}>
                {hero.ctaSecondary.label}
              </a>
            )}
          </div>
        </div>

        {heroImageUrl && (
          <div className={styles.imageWrap}>
            <span className={styles.imageBg} aria-hidden="true" />
            <div className={styles.imageInner}>
              <Image
                src={heroImageUrl}
                alt=""
                fill
                sizes="(min-width: 1000px) 45vw, 100vw"
                priority
                className={styles.image}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
