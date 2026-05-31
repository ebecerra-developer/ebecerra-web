import { getTranslations } from "next-intl/server";
import AnnotatedText from "@/components/AnnotatedText";
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
    <section id="inicio" aria-labelledby="hero-heading" className={styles.hero}>
      <div className={styles.grid}>
        <div className={styles.textCol}>
          <div className={styles.kicker}>
            <span className={styles.kickerDot} />
            <span className={styles.kickerText}>
              {kicker.replace(/^\/\/\s*/, "")}
            </span>
          </div>

          <h1 id="hero-heading" className={styles.heading}>
            <AnnotatedText text={title} />
          </h1>

          <p className={`lead ${styles.lead}`}>{lead}</p>

          <div className={styles.ctas}>
            <a href="#contacto" className={`${styles.ctaPrimary} fx-ripple`}>
              <span className={styles.ctaLabel}>{ctaPrimary}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </a>
            <a href="#servicios" className={`${styles.ctaSecondary} fx-soft`}>
              {ctaSecondary}
            </a>
          </div>

          <ul className={styles.metaStrip}>
            {trustBadges.map((badge, i) => (
              <li key={i} className={styles.badge}>
                {badge}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.photoCol}>
          <div className={styles.figurePanel}>
            <span aria-hidden="true" className={styles.figureGlow} />
            <span aria-hidden="true" className={styles.photoStar}>
              ✦
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-figure.png"
              alt="Enrique Becerra"
              width={768}
              height={1365}
              className={styles.figure}
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
