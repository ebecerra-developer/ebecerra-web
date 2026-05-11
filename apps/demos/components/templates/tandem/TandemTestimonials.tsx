import type { DemoSectionHeader, DemoTestimonial } from "@ebecerra/sanity-client";
import styles from "./TandemTestimonials.module.css";

const TONES = ["cobalt", "coral", "sage"] as const;

export default function TandemTestimonials({
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
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="testimonials-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
        </header>

        <ul className={styles.grid}>
          {testimonials.map((t, i) => (
            <li
              key={i}
              className={styles.card}
              data-tone={TONES[i % TONES.length]}
            >
              <span className={styles.mark} aria-hidden="true">“</span>
              <blockquote className={styles.quote}>{t.quote}</blockquote>
              <footer className={styles.meta}>
                <p className={styles.author}>{t.author}</p>
                {t.context && <p className={styles.context}>{t.context}</p>}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
