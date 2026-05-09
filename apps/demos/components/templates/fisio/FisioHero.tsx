import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioHero.module.css";

export default function FisioHero({ demo }: { demo: DemoSite }) {
  const hero = demo.hero;
  if (!hero) return null;

  const imageUrl = hero.image
    ? urlFor(hero.image).width(2000).auto("format").url()
    : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      {imageUrl ? (
        <div className={styles.bgImage}>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            priority
            quality={85}
          />
        </div>
      ) : (
        <div className={styles.bgPlaceholder} aria-hidden="true" />
      )}

      <div className={styles.inner}>
        <div className={styles.content}>
          {demo.tagline && (
            <span className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              {demo.tagline}
            </span>
          )}
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

        <aside className={styles.aside} aria-hidden="true">
          <div className={styles.statCard}>
            <span className={styles.statValue}>50&apos;</span>
            <span className={styles.statLabel}>
              Sesiones largas, sin solapamiento
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>+1.000</span>
            <span className={styles.statLabel}>
              Pacientes recuperados desde 2018
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
