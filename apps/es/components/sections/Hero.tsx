import { getTranslations } from "next-intl/server";
import AnnotatedText from "@/components/AnnotatedText";
import LogoMark from "@/components/LogoMark";
import styles from "./Hero.module.css";

export default async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section
      id="inicio"
      aria-labelledby="hero-heading"
      className={styles.hero}
    >
      <div className={styles.grid}>
        <div>
          <div className={styles.kicker}>
            <span className={styles.kickerDot} />
            <span className={styles.kickerText}>
              {t("kicker").replace(/^\/\/\s*/, "")}
            </span>
          </div>
          <h1
            id="hero-heading"
            className={styles.heading}
          >
            <AnnotatedText text={t("title")} />
          </h1>
          <p className={`lead ${styles.lead}`}>
            {t("lead")}
          </p>
          <div className={styles.ctas}>
            <a href="#contacto" className={styles.ctaPrimary}>
              → {t("ctaPrimary")}
            </a>
            <a href="#servicios" className={styles.ctaSecondary}>
              {t("ctaSecondary")}
            </a>
          </div>

          <div className={styles.metaStrip}>
            <span>{t("metaExperience")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("metaResponse")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("metaQuality")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("metaLocation")}</span>
          </div>
        </div>

        <div className={styles.monogramWrapper}>
          <LogoMark
            variant="scaleDeep"
            height="auto"
            alt="eB"
            className={styles.monogramImg}
          />
        </div>
      </div>
    </section>
  );
}
