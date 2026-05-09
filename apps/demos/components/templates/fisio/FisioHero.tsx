import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioHero.module.css";

export default function FisioHero({ demo }: { demo: DemoSite }) {
  const hero = demo.hero;
  if (!hero) return null;

  const imageUrl = hero.image
    ? urlFor(hero.image).width(1200).auto("format").url()
    : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div>
          {hero.kicker && <p className={styles.kicker}>{hero.kicker}</p>}
          <h1 id="hero-heading" className={styles.heading}>
            {hero.heading ?? demo.businessName}
          </h1>
          {hero.sub && <p className={styles.sub}>{hero.sub}</p>}
          <div className={styles.ctas}>
            {hero.ctaPrimary.label && (
              <a
                href={hero.ctaPrimary.href ?? "#contacto"}
                className={styles.ctaPrimary}
              >
                {hero.ctaPrimary.label}
              </a>
            )}
            {hero.ctaSecondary.label && (
              <a
                href={hero.ctaSecondary.href ?? "#servicios"}
                className={styles.ctaSecondary}
              >
                {hero.ctaSecondary.label}
              </a>
            )}
          </div>
        </div>
        <div className={styles.media}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={hero.heading ?? demo.businessName}
              fill
              sizes="(min-width: 900px) 45vw, 100vw"
              priority
            />
          ) : (
            <div className={styles.mediaPlaceholder}>{demo.businessName}</div>
          )}
        </div>
      </div>
    </section>
  );
}
