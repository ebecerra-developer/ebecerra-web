import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./ExpedicionTestimonials.module.css";

type Header = DemoSite["testimonialsSection"];
type Testimonials = DemoSite["testimonials"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ExpedicionTestimonials({
  header,
  testimonials,
}: {
  header: Header;
  testimonials: Testimonials;
}) {
  return (
    <section id="opiniones" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && <h2 className={styles.title}>{header.title}</h2>}
        </header>

        <ul className={styles.grid}>
          {testimonials.map((t, i) => (
            <li key={i} className={styles.card}>
              <p className={styles.quote}>“{t.quote}”</p>
              <div className={styles.author}>
                <div className={styles.avatar}>
                  {t.photo ? (
                    <Image
                      src={urlFor(t.photo).width(96).height(96).fit("crop").url()}
                      alt={t.author}
                      fill
                      sizes="44px"
                      className={styles.avatarImg}
                    />
                  ) : (
                    <span aria-hidden="true">{initials(t.author)}</span>
                  )}
                </div>
                <div>
                  <p className={styles.name}>{t.author}</p>
                  {t.context && <p className={styles.context}>{t.context}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
