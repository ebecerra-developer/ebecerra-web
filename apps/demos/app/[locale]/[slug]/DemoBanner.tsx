import { getLocale } from "next-intl/server";
import { getDemosBannerSettings } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import styles from "./DemoBanner.module.css";

export default async function DemoBanner({
  template,
}: {
  /**
   * Si se pasa, el banner adopta los tokens de esa plantilla (data-template),
   * para que el aviso combine con la demo. Sin prop, usa los tokens base (:root).
   * Pensado para casos puntuales (ej. gestoría → azul marino).
   */
  template?: string;
} = {}) {
  const locale = (await getLocale()) as Locale;
  const banner = await getDemosBannerSettings(locale);
  return (
    <div
      className={styles.banner}
      data-template={template}
      role="region"
      aria-label={banner.label}
    >
      <div className={styles.inner}>
        <span className={styles.label}>{banner.label}</span>
        <p className={styles.text}>{banner.text}</p>
        <a href={banner.ctaHref} className={styles.cta}>
          {banner.ctaLabel} →
        </a>
      </div>
    </div>
  );
}
