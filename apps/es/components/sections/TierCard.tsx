"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ServicesPricingTier } from "@ebecerra/sanity-client";
import styles from "./Services.module.css";

type Props = {
  tier: ServicesPricingTier;
  defaultCtaLabel: string;
};

// Tarjeta de plan que "da la vuelta": delante el gancho (para quién + precio +
// 3 meses gratis), detrás el detalle (todo lo incluido + CTA). En desktop gira
// con el hover (CSS); en móvil/touch con el tap (estado); con teclado, al enfocar
// el CTA del dorso (:focus-within). Ambas caras están siempre en el DOM, así que
// un lector de pantalla las lee completas aunque no haya giro visual.
export default function TierCard({ tier, defaultCtaLabel }: Props) {
  const t = useTranslations("services");
  const [flipped, setFlipped] = useState(false);

  function handleToggle() {
    // Solo con tap en dispositivos sin hover; en desktop el giro lo hace :hover.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches
    ) {
      setFlipped((v) => !v);
    }
  }

  return (
    <div
      className={`${styles.flip} ${tier.highlighted ? styles.flipHighlighted : ""}`}
      data-flipped={flipped}
    >
      <div className={styles.flipInner}>
        {/* Cara delantera — el gancho */}
        <div className={styles.flipFront} onClick={handleToggle}>
          {tier.highlighted && tier.badge && (
            <span className={styles.cardBadge}>{tier.badge}</span>
          )}
          <p className={styles.cardName}>{tier.name}</p>
          {tier.subtitle && (
            <p className={styles.cardSubtitle}>{tier.subtitle}</p>
          )}
          <p className={styles.cardPrice}>{tier.priceMain}</p>
          <div className={styles.cardSub}>
            {tier.priceSecondary && (
              <span className={styles.cardPriceSecondary}>
                {tier.priceSecondary}
              </span>
            )}
            {tier.conditions && (
              <span className={styles.cardConditions}>{tier.conditions}</span>
            )}
          </div>
          <span className={styles.flipHint} aria-hidden="true">
            {t("flipFront")} ↻
          </span>
        </div>

        {/* Cara trasera — el detalle + acción */}
        <div className={styles.flipBack} onClick={handleToggle}>
          <p className={styles.flipBackTitle}>{t("included")}</p>
          {tier.features.length > 0 && (
            <ul className={styles.featuresList}>
              {tier.features.map((f, i) => (
                <li
                  key={i}
                  className={`${styles.featureItem} ${
                    f.highlight ? styles.featureHighlight : ""
                  }`}
                >
                  <span className={styles.featureArrow} aria-hidden="true">
                    {f.highlight ? "✦" : "→"}
                  </span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          )}
          <a
            href={tier.ctaHref || "#contacto"}
            className={`${styles.cardCta} fx-ripple ${
              tier.highlighted ? styles.cardCtaPrimary : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {tier.ctaLabel || defaultCtaLabel} →
          </a>
        </div>
      </div>
    </div>
  );
}
