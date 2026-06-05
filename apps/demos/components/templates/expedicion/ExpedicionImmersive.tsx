import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./ExpedicionImmersive.module.css";

/**
 * Hero de la plantilla Expedición: solo el CONTENIDO (titular DOM real + CTAs).
 * Es la primera escena del stage inmersivo; el fondo POV y el marco los pone el
 * stage. La pista de scroll también la pone el stage.
 */

type Hero = NonNullable<DemoSite["hero"]>;

function renderHeading(h: string) {
  // *palabra* → resaltada con el acento de la marca
  return h.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className={styles.hl}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ExpedicionImmersive({ hero }: { hero: Hero }) {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}>
        {hero.kicker && (
          <p className={styles.kicker}>
            <span className={styles.kickerDot} aria-hidden="true" />
            {hero.kicker}
          </p>
        )}
        {hero.heading && (
          <h1 className={styles.heading}>{renderHeading(hero.heading)}</h1>
        )}
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
              href={hero.ctaSecondary.href ?? "#actividades"}
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
