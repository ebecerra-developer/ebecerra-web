import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachObjectives.module.css";

/**
 * Sección "Para quién es esto" / "Tus objetivos" (referencia: javierentrenador.es).
 * Grid de 3-6 cards segmentando perfiles de cliente/objetivo: perder peso,
 * ganar fuerza, prepararte para el parto, entrenar en menopausia, etc.
 * Sirve también como SEO long-tail.
 *
 * TODO (plan): añadir al schema `objectives[]` con
 * `{ icon: string, title: localeString, description: localeText, anchor: string }`.
 */
export default function CoachObjectives({ demo: _demo }: { demo: DemoSite }) {
  return (
    <section className={styles.objectives} aria-label="Objetivos">
      <div className={styles.placeholder} data-todo="schema">
        Objetivos / para quién — pendiente schema (objectives[])
      </div>
    </section>
  );
}
