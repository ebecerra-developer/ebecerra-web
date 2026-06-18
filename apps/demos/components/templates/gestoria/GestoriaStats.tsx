import type { GestoriaContent } from "./content";
import GestoriaCountUp from "./GestoriaCountUp";
import styles from "./GestoriaStats.module.css";

/**
 * WOW #2 — contadores con count-up al entrar en viewport y subrayado a mano en
 * los datos clave. El número es serio (años, clientes, 0 sanciones); la
 * animación solo dirige la mirada.
 */
export default function GestoriaStats({ content }: { content: GestoriaContent }) {
  const s = content.stats;

  return (
    <section className={styles.section} aria-labelledby="stats-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {s.kicker}
          </p>
          <h2 id="stats-heading" className={styles.title}>
            {s.title}
          </h2>
          <p className={styles.lead}>{s.lead}</p>
        </header>

        <ul className={styles.grid}>
          {s.items.map((item) => (
            <li key={item.label} className={styles.item}>
              <GestoriaCountUp
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                emphasis={item.emphasis}
              />
              <p className={styles.label}>{item.label}</p>
            </li>
          ))}
        </ul>

        <p className={styles.note}>{s.note}</p>
      </div>
    </section>
  );
}
