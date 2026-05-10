import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachStats.module.css";

/**
 * Tira de credenciales numeradas (referencia: Edu Veiga "+10.000 sesiones").
 * Render condicional cuando el array tiene >= 1 entrada.
 */
export default function CoachStats({ demo }: { demo: DemoSite }) {
  const stats = demo.coachStats;
  if (stats.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Credenciales">
      <div className={styles.inner}>
        <ul className={styles.grid} data-count={stats.length}>
          {stats.map((stat, i) => (
            <li key={i} className={styles.item}>
              <p className={styles.value}>{stat.value}</p>
              <p className={styles.label}>{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
