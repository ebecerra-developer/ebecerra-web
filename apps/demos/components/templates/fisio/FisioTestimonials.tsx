import Image from "next/image";
import type {
  DemoSectionHeader,
  DemoTestimonial,
} from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioTestimonials.module.css";

export default function FisioTestimonials({
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
          {header?.kicker && (
            <p className={styles.sectionIndex}>
              <span className={styles.indexNumber}>04</span>
              <span>{header.kicker.replace(/^\/\/\s*/, "")}</span>
            </p>
          )}
          {header?.title && (
            <h2 id="testimonials-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
        </header>

        <ul className={styles.grid}>
          {testimonials.map((t, i) => {
            const photoUrl = t.photo
              ? urlFor(t.photo).width(120).auto("format").url()
              : null;
            const initial = t.author.charAt(0).toUpperCase();
            return (
              <li key={i} className={styles.card}>
                <span className={styles.bigQuote} aria-hidden="true">“</span>
                <p className={styles.quote}>{t.quote}</p>
                <div className={styles.author}>
                  <div className={styles.photo}>
                    {photoUrl ? (
                      <Image src={photoUrl} alt={t.author} fill sizes="48px" />
                    ) : (
                      <span className={styles.photoFallback}>{initial}</span>
                    )}
                  </div>
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
