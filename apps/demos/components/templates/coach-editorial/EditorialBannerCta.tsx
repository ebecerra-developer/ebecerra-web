import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./EditorialBannerCta.module.css";

/**
 * Banner CTA dark warm — único bloque dramático en la plantilla.
 * Tipografía display gigante en cream sobre fondo dark warm.
 */
export default function EditorialBannerCta({ demo }: { demo: DemoSite }) {
  if (!demo.tagline) return null;
  const ctaLabel = demo.hero?.ctaPrimary?.label ?? "Reservar primera sesión";
  const ctaHref = demo.hero?.ctaPrimary?.href ?? "#contacto";

  return (
    <section className={styles.banner} aria-label={ctaLabel}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} />
          <span>Empezamos por aquí</span>
        </p>
        <p className={styles.headline}>{demo.tagline}</p>
        <a href={ctaHref} className={styles.cta}>
          {ctaLabel}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
