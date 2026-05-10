import type { DemoSectionHeader, DemoTestimonial } from "@ebecerra/sanity-client";
import styles from "./VibrantTestimonials.module.css";

/**
 * Testimonios estilo "screenshot" o card chat. Cada uno con bg color
 * distinto, rotación sutil, y autor con dot de avatar.
 */
export default function VibrantTestimonials({
  header,
  testimonials,
}: {
  header: DemoSectionHeader | null;
  testimonials: DemoTestimonial[];
}) {
  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.inner}>
        {(header?.kicker || header?.title) && (
          <header className={styles.header}>
            {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
            {header?.title && (
              <h2 id="testimonials-heading" className={styles.title}>{header.title}</h2>
            )}
          </header>
        )}

        <ul className={styles.grid}>
          {testimonials.map((t, i) => (
            <li key={i} className={styles.card} data-tone={["lilac", "acid", "magenta"][i % 3]}>
              <p className={styles.quote}>"{t.quote}"</p>
              <div className={styles.author}>
                <span className={styles.avatar} aria-hidden="true">
                  {t.author.charAt(0)}
                </span>
                <div>
                  <p className={styles.authorName}>{t.author}</p>
                  {t.context && <p className={styles.authorContext}>{t.context}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
