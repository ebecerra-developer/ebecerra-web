import { getLocale } from "next-intl/server";
import { getDemosBannerSettings } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import styles from "./DemoBanner.module.css";

export default async function DemoBanner() {
  const locale = (await getLocale()) as Locale;
  const banner = await getDemosBannerSettings(locale);
  return (
    <div className={styles.banner} role="region" aria-label={banner.label}>
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
