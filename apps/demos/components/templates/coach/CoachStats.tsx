import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachStats.module.css";

/**
 * Tira de credenciales numeradas (referencia: Edu Veiga "+10.000 entrenamientos").
 * Útil para coach con marca personal: año de inicio, sesiones acumuladas,
 * clientas activas, certificaciones.
 *
 * TODO (plan): añadir al schema demoSite el array `coachStats[]` con
 * `{ value: localeString, label: localeString }`. Render condicional cuando
 * el array tenga >= 1 entrada.
 */
export default function CoachStats({ demo: _demo }: { demo: DemoSite }) {
  return (
    <section className={styles.stats} aria-label="Credenciales">
      <div className={styles.placeholder} data-todo="schema">
        Stats coach — pendiente schema (coachStats[])
      </div>
    </section>
  );
}
