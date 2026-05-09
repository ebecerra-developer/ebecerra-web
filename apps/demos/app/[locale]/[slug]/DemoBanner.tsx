import { useTranslations } from "next-intl";
import styles from "./DemoBanner.module.css";

export default function DemoBanner() {
  const t = useTranslations("demoBanner");
  return (
    <div className={styles.banner} role="region" aria-label={t("label")}>
      <div className={styles.inner}>
        <span className={styles.label}>{t("label")}</span>
        <p className={styles.text}>{t("text")}</p>
        <a href={t("ctaHref")} className={styles.cta}>
          {t("ctaLabel")} →
        </a>
      </div>
    </div>
  );
}
