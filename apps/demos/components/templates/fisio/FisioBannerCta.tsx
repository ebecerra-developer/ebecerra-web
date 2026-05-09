import type { DemoSite } from "@ebecerra/sanity-client";
import { getTranslations } from "next-intl/server";
import styles from "./FisioBannerCta.module.css";

/**
 * Banner intermedio que rompe la cadencia visual entre secciones.
 * Reusa el tagline + CTA primario del hero — sin nuevos campos en schema.
 */
export default async function FisioBannerCta({ demo }: { demo: DemoSite }) {
  if (!demo.tagline) return null;
  const t = await getTranslations("fisio");
  const ctaLabel = demo.hero?.ctaPrimary.label ?? t("callToAction");
  const ctaHref = demo.hero?.ctaPrimary.href ?? "#contacto";

  return (
    <section className={styles.banner} aria-label={ctaLabel}>
      <div className={styles.inner}>
        <div>
          <p className={styles.kicker}>
            <span className={styles.kickerLine} />
            <span>Manifiesto</span>
          </p>
          <p className={styles.headline}>
            <span className={styles.headlineMark}>“</span>
            {demo.tagline}
            <span className={styles.headlineMark}>”</span>
          </p>
        </div>
        <div className={styles.actions}>
          <a href={ctaHref} className={styles.cta}>
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
