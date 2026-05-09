import Image from "next/image";
import type { DemoAbout } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioAbout.module.css";

export default function FisioAbout({ about }: { about: DemoAbout }) {
  const imageUrl = about.image
    ? urlFor(about.image).width(900).auto("format").url()
    : null;
  const eyebrowText = about.kicker?.replace(/^\/\/\s*/, "");

  return (
    <section
      id="sobre"
      className={styles.section}
      aria-labelledby="about-heading"
    >
      <div className={styles.inner}>
        <div className={styles.content}>
          {eyebrowText && (
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{eyebrowText}</span>
            </p>
          )}
          {about.title && (
            <h2 id="about-heading" className={styles.title}>
              {about.title}
            </h2>
          )}
          {about.body && <p className={styles.body}>{about.body}</p>}
          {about.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {about.bullets.map((b, i) => (
                <li key={i} className={styles.bullet}>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.media}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={about.title ?? ""}
              fill
              sizes="(min-width: 900px) 45vw, 100vw"
            />
          ) : (
            <div className={styles.mediaPlaceholder}>{about.title ?? ""}</div>
          )}
        </div>
      </div>
    </section>
  );
}
