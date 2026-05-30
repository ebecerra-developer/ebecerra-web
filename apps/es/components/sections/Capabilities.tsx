import type { CapabilitiesSection } from "@ebecerra/sanity-client";
import { DEFAULT_CAPABILITIES_SECTION } from "@ebecerra/sanity-client";
import styles from "./Capabilities.module.css";

type Props = {
  section?: CapabilitiesSection | null;
};

export default function Capabilities({ section }: Props) {
  const data = section ?? DEFAULT_CAPABILITIES_SECTION;
  const items = data.items.length > 0 ? data.items : DEFAULT_CAPABILITIES_SECTION.items;

  return (
    <section
      id="capacidades"
      aria-labelledby="capabilities-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.kicker}>
            {"// "}
            <span className={styles.kickerAccent}>03.</span>{" "}
            {data.kicker ?? ""}
          </div>
          <h2 id="capabilities-heading" className={styles.heading}>
            {data.title ?? ""}
          </h2>
          {data.lead && <p className={`lead ${styles.lead}`}>{data.lead}</p>}
        </header>

        <div className={styles.grid}>
          {items.map((cap, idx) => (
            <article
              key={`${cap.title}-${idx}`}
              className={
                cap.featured ? `${styles.card} ${styles.cardFeatured}` : styles.card
              }
            >
              <div className={styles.iconRow}>
                <span className={styles.icon} aria-hidden="true">
                  {cap.icon}
                </span>
                {cap.badge && <span className={styles.badge}>{cap.badge}</span>}
              </div>
              <h3 className={styles.cardTitle}>{cap.title}</h3>
              <p className={styles.cardDesc}>{cap.description}</p>
              {cap.bullets.length > 0 && (
                <ul className={styles.bullets}>
                  {cap.bullets.map((b, bi) => (
                    <li key={bi} className={styles.bullet}>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {(data.noteLabel || data.noteText) && (
          <div className={styles.note}>
            {data.noteLabel && (
              <span className={styles.noteLabel}>{data.noteLabel}</span>
            )}
            {data.noteText && (
              <p className={styles.noteText}>{data.noteText}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
