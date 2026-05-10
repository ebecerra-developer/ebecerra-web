import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./CoachPricing.module.css";

/**
 * Tabla de precios pública en bonos (referencia: akromove.es).
 * Patrón columna por modalidad (individual / pareja / grupo) × fila por
 * volumen de sesiones (suelta / bono 4 / bono 8 / bono 12).
 *
 * Render condicional vía flag `showPricing`. Por defecto OFF.
 *
 * TODO (plan): añadir al schema `pricing { enabled, kicker, title, lead,
 * tiers[]: { label, sessions, prices[]: { modality, amount, perSession } },
 * note }`.
 */
export default function CoachPricing({ demo: _demo }: { demo: DemoSite }) {
  // const enabled = demo.pricing?.enabled ?? false;
  // if (!enabled) return null;
  return (
    <section className={styles.pricing} aria-label="Precios">
      <div className={styles.placeholder} data-todo="schema">
        Precios en bonos — pendiente schema (pricing.enabled + tiers[])
      </div>
    </section>
  );
}
