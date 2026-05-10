import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachObjectives.module.css";

/**
 * Sección "Para quién es esto" / "Tus objetivos" (referencia: javierentrenador.es).
 * Grid de cards segmentando perfiles/objetivos. Sin CTA: la sección segmenta,
 * no convierte (la conversión es contacto/booking más abajo).
 */
export default function CoachObjectives({ demo }: { demo: DemoSite }) {
  const objectives = demo.objectives;
  if (objectives.length === 0) return null;

  const header = demo.objectivesSection;
  const eyebrowText = header?.kicker?.replace(/^\/\/\s*/, "");

  return (
    <section
      id="objetivos"
      className={styles.section}
      aria-labelledby="objectives-heading"
    >
      <div className={styles.inner}>
        {(eyebrowText || header?.title || header?.lead) && (
          <header className={styles.header}>
            {eyebrowText && (
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowLine} />
                <span>{eyebrowText}</span>
                <span className={styles.eyebrowLine} />
              </p>
            )}
            {header?.title && (
              <h2 id="objectives-heading" className={styles.title}>
                {header.title}
              </h2>
            )}
            {header?.lead && <p className={styles.lead}>{header.lead}</p>}
          </header>
        )}

        <ul className={styles.grid} data-count={objectives.length}>
          {objectives.map((obj, i) => (
            <li key={i} className={styles.card}>
              {obj.icon && <span className={styles.icon}>{obj.icon}</span>}
              <h3 className={styles.cardTitle}>{obj.title}</h3>
              {obj.description && (
                <p className={styles.cardDesc}>{obj.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
