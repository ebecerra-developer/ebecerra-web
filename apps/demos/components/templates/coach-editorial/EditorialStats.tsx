import type { DemoCoachStat } from "@ebecerra/sanity-client";
import styles from "./EditorialStats.module.css";

export default function EditorialStats({ stats }: { stats: DemoCoachStat[] }) {
  return (
    <section className={styles.section} aria-label="Credenciales">
      <div className={styles.inner}>
        <ul className={styles.list}>
          {stats.map((stat, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.value}>{stat.value}</span>
              <span className={styles.label}>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
