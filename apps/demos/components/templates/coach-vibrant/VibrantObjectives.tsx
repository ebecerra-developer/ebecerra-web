import type { DemoSectionHeader, DemoObjective } from "@ebecerra/sanity-client";
import styles from "./VibrantObjectives.module.css";

export default function VibrantObjectives({
  header,
  objectives,
}: {
  header: DemoSectionHeader | null;
  objectives: DemoObjective[];
}) {
  return (
    <section className={styles.section} aria-labelledby="objectives-heading">
      <div className={styles.inner}>
        {(header?.kicker || header?.title) && (
          <header className={styles.header}>
            {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
            {header?.title && (
              <h2 id="objectives-heading" className={styles.title}>{header.title}</h2>
            )}
            {header?.lead && <p className={styles.lead}>{header.lead}</p>}
          </header>
        )}
        <ul className={styles.list}>
          {objectives.map((obj, i) => (
            <li key={i} className={styles.item}>
              {obj.icon && <span className={styles.icon}>{obj.icon}</span>}
              <h3 className={styles.itemTitle}>{obj.title}</h3>
              {obj.description && (
                <p className={styles.itemDesc}>{obj.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
