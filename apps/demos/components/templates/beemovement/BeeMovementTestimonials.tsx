import type { DemoSectionHeader, DemoTestimonial } from "@ebecerra/sanity-client";
import styles from "./BeeMovementTestimonials.module.css";

const TINTS = [styles.tintMustard, styles.tintRose, styles.tintForest];

export default function BeeMovementTestimonials({
  header,
  testimonials,
}: {
  header: DemoSectionHeader | null;
  testimonials: DemoTestimonial[];
}) {
  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          {header?.kicker && <p className={styles.eyebrow}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="testimonials-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          <p className={styles.aggregate}>22 opiniones en Google, todas 5 de 5</p>
        </header>

        <ul className={styles.grid}>
          {testimonials.map((t, i) => {
            const initial = t.author.charAt(0).toUpperCase();
            return (
              <li key={i} className={styles.card}>
                <span className={styles.quoteMark} aria-hidden="true">
                  &ldquo;
                </span>
                <div className={styles.stars} aria-label="5 estrellas">
                  <span aria-hidden="true">★★★★★</span>
                </div>
                <p className={styles.quote}>&ldquo;{t.quote}&rdquo;</p>
                <div className={styles.author}>
                  <span className={`${styles.photoFallback} ${TINTS[i % TINTS.length]}`}>
                    {initial}
                  </span>
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>{t.author}</span>
                    {t.context && (
                      <span className={styles.authorContext}>{t.context}</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
