import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./EditorialHero.module.css";

/**
 * Hero editorial: split asimétrico (texto izq 7col / imagen der 5col),
 * tipografía display serif gigante. Kicker arriba con número de issue
 * estilo magazine. Sub bajo el título. CTAs abajo.
 */
export default function EditorialHero({ demo }: { demo: DemoSite }) {
  const hero = demo.hero;
  if (!hero?.heading) return null;

  const heroImageUrl = hero.image
    ? urlFor(hero.image).width(1400).height(1800).auto("format").url()
    : null;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.text}>
          {hero.kicker && (
            <p className={styles.kicker}>
              <span className={styles.kickerLine} />
              <span>{hero.kicker}</span>
            </p>
          )}
          <h1 id="hero-heading" className={styles.heading}>
            {hero.heading}
          </h1>
          {hero.sub && <p className={styles.sub}>{hero.sub}</p>}
          <div className={styles.actions}>
            {hero.ctaPrimary?.label && (
              <a href={hero.ctaPrimary.href ?? "#contacto"} className={styles.ctaPrimary}>
                {hero.ctaPrimary.label}
                <span aria-hidden="true">→</span>
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
            <Image
              src={heroImageUrl}
              alt=""
              fill
              sizes="(min-width: 1000px) 40vw, 100vw"
              priority
              className={styles.image}
            />
            <div className={styles.imageFrame} aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
