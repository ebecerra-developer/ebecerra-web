import type { DemoSite } from "@ebecerra/sanity-client";
import TandemHeroWords from "./TandemHeroWords";
import styles from "./TandemHero.module.css";

/**
 * Hero tándem: titular chunky con palabra-acento en serif italic +
 * word-swap rotativo + ticker inferior. Estética fanzine.
 */
export default function TandemHero({ demo }: { demo: DemoSite }) {
  const hero = demo.hero;
  if (!hero?.heading) return null;

  // El titular en Sanity usa el patrón "lead {{serif:palabra}} resto".
  // Si no hay match, se renderiza plano.
  const heading = hero.heading;
  const match = heading.match(/^(.*?)\{\{serif:(.+?)\}\}(.*)$/);

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <span className={`${styles.sticker} ${styles.stickerCobalt}`} aria-hidden="true">
        ★ nueva
      </span>
      <span className={`${styles.sticker} ${styles.stickerCoral}`} aria-hidden="true">
        ↓ scroll
      </span>

      <div className={styles.inner}>
        {hero.kicker && (
          <p className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden="true" />
            {hero.kicker}
          </p>
        )}

        <h1 id="hero-heading" className={styles.heading}>
          {match ? (
            <>
              {match[1]}
              <span className={styles.serif}>{match[2]}</span>
              {match[3]}
            </>
          ) : (
            heading
          )}
        </h1>

        <TandemHeroWords />

        {hero.sub && <p className={styles.sub}>{hero.sub}</p>}

        <div className={styles.actions}>
          {hero.ctaPrimary?.label && (
            <a
              href={hero.ctaPrimary.href ?? "#contacto"}
              className={styles.ctaPrimary}
            >
              {hero.ctaPrimary.label}
            </a>
          )}
          {hero.ctaSecondary?.label && (
            <a
              href={hero.ctaSecondary.href ?? "#servicios"}
              className={styles.ctaSecondary}
            >
              {hero.ctaSecondary.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
