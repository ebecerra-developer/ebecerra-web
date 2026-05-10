import Image from "next/image";
import type { DemoAbout } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./VibrantAbout.module.css";

export default function VibrantAbout({ about }: { about: DemoAbout }) {
  const imgUrl = about.image
    ? urlFor(about.image).width(1200).height(1500).auto("format").url()
    : null;

  return (
    <section id="sobre" className={styles.section} aria-labelledby="about-heading">
      <span className={styles.bgBlock} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.text}>
          {about.kicker && <p className={styles.kicker}>{about.kicker}</p>}
          {about.title && (
            <h2 id="about-heading" className={styles.heading}>{about.title}</h2>
          )}
          {about.body && <p className={styles.body}>{about.body}</p>}
          {about.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {about.bullets.map((b, i) => (
                <li key={i} className={styles.bullet}>
                  <span className={styles.bulletDot} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>
        {imgUrl && (
          <div className={styles.imageWrap}>
            <Image src={imgUrl} alt="" fill sizes="(min-width: 1000px) 45vw, 100vw" className={styles.image} />
          </div>
        )}
      </div>
    </section>
  );
}
