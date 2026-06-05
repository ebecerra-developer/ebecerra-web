import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./ExpedicionAbout.module.css";

type About = NonNullable<DemoSite["about"]>;

export default function ExpedicionAbout({ about }: { about: About }) {
  return (
    <section id="experiencia" className={styles.section}>
      <div className={`${styles.inner} ${about.image ? "" : styles.noMedia}`}>
        <div className={styles.text}>
          {about.kicker && <p className={styles.kicker}>{about.kicker}</p>}
          {about.title && <h2 className={styles.title}>{about.title}</h2>}
          {about.body && <p className={styles.body}>{about.body}</p>}
          {about.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {about.bullets.map((b, i) => (
                <li key={i} className={styles.bullet}>
                  <span className={styles.check} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        {about.image && (
          <div className={styles.media}>
            <Image
              src={urlFor(about.image).width(900).height(1100).fit("crop").url()}
              alt={about.title ?? ""}
              fill
              sizes="(max-width: 920px) 100vw, 480px"
              className={styles.mediaImg}
            />
            <span className={styles.frameCorner} aria-hidden="true" />
          </div>
        )}
      </div>
    </section>
  );
}
