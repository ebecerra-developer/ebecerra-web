import type { DemoSectionHeader, DemoTestimonial } from "@ebecerra/sanity-client";
import styles from "./EditorialTestimonials.module.css";

/**
 * Testimonios como pull-quotes editoriales: una cita protagonista grande
 * arriba, dos pequeñas debajo. Sin foto.
 */
export default function EditorialTestimonials({
  header,
  testimonials,
}: {
  header: DemoSectionHeader | null;
  testimonials: DemoTestimonial[];
}) {
  const [feature, ...rest] = testimonials;
  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.inner}>
        {header?.title && (
          <header className={styles.header}>
            {header.kicker && <p className={styles.kicker}>{header.kicker}</p>}
            <h2 id="testimonials-heading" className={styles.title}>{header.title}</h2>
          </header>
        )}

        {feature && (
          <figure className={styles.feature}>
            <span className={styles.markOpen} aria-hidden="true">"</span>
            <blockquote className={styles.featureQuote}>
              {feature.quote}
            </blockquote>
            <figcaption className={styles.featureCaption}>
              <span className={styles.author}>{feature.author}</span>
              {feature.context && (
                <span className={styles.context}> — {feature.context}</span>
              )}
            </figcaption>
          </figure>
        )}

        {rest.length > 0 && (
          <ul className={styles.restGrid}>
            {rest.map((t, i) => (
              <li key={i} className={styles.restItem}>
                <blockquote className={styles.restQuote}>"{t.quote}"</blockquote>
                <p className={styles.restAuthor}>
                  <span>{t.author}</span>
                  {t.context && <span className={styles.context}> · {t.context}</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
