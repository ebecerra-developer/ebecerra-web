import type { DemoCoachStat } from "@ebecerra/sanity-client";
import styles from "./VibrantStats.module.css";

/**
 * Stats vibrant: tira horizontal scroll-able tipo "ticker" con cards
 * pill alternando colores acid/lilac/magenta-soft. Pequeñas, no protagonistas.
 */
export default function VibrantStats({ stats }: { stats: DemoCoachStat[] }) {
  return (
    <section className={styles.section} aria-label="Credenciales">
      <ul className={styles.list}>
        {stats.map((stat, i) => (
          <li
            key={i}
            className={styles.item}
            data-tone={["acid", "lilac", "magenta", "ink"][i % 4]}
          >
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
