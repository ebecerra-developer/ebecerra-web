import Image from "next/image";
import type { DemoAbout } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./EditorialAbout.module.css";

/**
 * About estilo magazine spread: imagen full-bleed left, texto en columna
 * derecha con tipografía display para el título y body en columna doble
 * tipo periódico para los párrafos largos.
 */
export default function EditorialAbout({ about }: { about: DemoAbout }) {
  const imgUrl = about.image
    ? urlFor(about.image).width(1200).height(1500).auto("format").url()
    : null;

  return (
    <section id="sobre" className={styles.section} aria-labelledby="about-heading">
      <div className={styles.inner}>
        {imgUrl && (
          <div className={styles.imageWrap}>
            <Image src={imgUrl} alt="" fill sizes="(min-width: 1000px) 45vw, 100vw" className={styles.image} />
          </div>
        )}
        <div className={styles.text}>
          {about.kicker && <p className={styles.kicker}>{about.kicker}</p>}
          {about.title && (
            <h2 id="about-heading" className={styles.heading}>
              {about.title}
            </h2>
          )}
          {about.body && (
            <p className={styles.body}>{about.body}</p>
          )}
          {about.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {about.bullets.map((b, i) => (
                <li key={i} className={styles.bullet}>
                  <span className={styles.bulletMark} aria-hidden="true">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
