import type { DemoSectionHeader, DemoObjective } from "@ebecerra/sanity-client";
import styles from "./TandemProcess.module.css";

export default function TandemProcess({
  header,
  steps,
}: {
  header: DemoSectionHeader | null;
  steps: DemoObjective[];
}) {
  return (
    <section
      id="proceso"
      className={styles.section}
      aria-labelledby="process-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="process-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ol className={styles.list}>
          {steps.map((step, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <div className={styles.content}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                {step.description && (
                  <p className={styles.stepDesc}>{step.description}</p>
                )}
              </div>
              {step.icon && <span className={styles.icon} aria-hidden="true">{step.icon}</span>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
