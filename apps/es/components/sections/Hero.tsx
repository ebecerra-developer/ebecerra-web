import { Fragment } from "react";
import { getTranslations } from "next-intl/server";
import AnnotatedText from "@/components/AnnotatedText";
import LogoMark from "@/components/LogoMark";
import type { HeroSection } from "@ebecerra/sanity-client";
import styles from "./Hero.module.css";

type Props = {
  sanityData?: HeroSection | null;
};

export default async function Hero({ sanityData }: Props) {
  const t = await getTranslations("hero");

  const kicker = sanityData?.kicker ?? t("kicker");
  const title = sanityData?.title ?? t("title");
  const lead = sanityData?.lead ?? t("lead");
  const ctaPrimary = sanityData?.ctaPrimary ?? t("ctaPrimary");
  const ctaSecondary = sanityData?.ctaSecondary ?? t("ctaSecondary");
  const trustBadges =
    sanityData?.trustBadges?.length
      ? sanityData.trustBadges
      : [t("metaExperience"), t("metaResponse"), t("metaQuality"), t("metaLocation")];

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
              {kicker.replace(/^\/\/\s*/, "")}
            </span>
          </div>
          <h1
            id="hero-heading"
            className={styles.heading}
          >
            <AnnotatedText text={title} />
          </h1>
          <p className={`lead ${styles.lead}`}>
            {lead}
          </p>
          <div className={styles.ctas}>
            <a href="#contacto" className={styles.ctaPrimary}>
              {ctaPrimary} →
            </a>
            <a href="#servicios" className={styles.ctaSecondary}>
              {ctaSecondary}
            </a>
          </div>

          <div className={styles.metaStrip}>
            {trustBadges.map((badge, i) => (
              <Fragment key={i}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <span>{badge}</span>
              </Fragment>
            ))}
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
