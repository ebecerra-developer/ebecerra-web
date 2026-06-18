import type { GestoriaContent } from "./content";
import styles from "./GestoriaTestimonials.module.css";

/** Iniciales del autor para el avatar (ej. "Marta L." → "ML"). */
function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .toUpperCase();
}

/**
 * Prueba social: testimonios (sector + ciudad), badge de reseñas de Google
 * (placeholder) y los sectores/perfiles que atienden ("este entiende lo mío").
 */
export default function GestoriaTestimonials({
  content,
}: {
  content: GestoriaContent;
}) {
  const t = content.testimonials;

  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.kicker}>
              <span className={styles.kickerMark} aria-hidden="true" />
              {t.kicker}
            </p>
            <h2 id="testimonials-heading" className={styles.title}>
              {t.title}
            </h2>
          </div>
          <div className={styles.google}>
            <span className={styles.stars} aria-hidden="true">
              ★★★★★
            </span>
            <span className={styles.googleRating}>{t.google.rating}</span>
            <span className={styles.googleMeta}>
              {t.google.count} {t.google.label}
            </span>
          </div>
        </div>

        <ul className={styles.cards}>
          {t.items.map((item) => (
            <li key={item.author} className={styles.card}>
              <span className={styles.quoteMark} aria-hidden="true">
                “
              </span>
              <blockquote className={styles.quote}>{item.quote}</blockquote>
              <footer className={styles.author}>
                <span className={styles.authorAvatar} aria-hidden="true">
                  {initials(item.author)}
                </span>
                <span className={styles.authorMeta}>
                  <span className={styles.authorName}>{item.author}</span>
                  <span className={styles.authorContext}>{item.context}</span>
                </span>
              </footer>
            </li>
          ))}
        </ul>

        <div className={styles.sectors}>
          <h3 className={styles.sectorsTitle}>{t.sectorsTitle}</h3>
          <ul className={styles.sectorList}>
            {t.sectors.map((sector) => (
              <li key={sector} className={styles.sectorPill}>
                {sector}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
