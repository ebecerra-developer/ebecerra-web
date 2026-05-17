"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { ServicesPricing } from "@ebecerra/sanity-client";
import styles from "./Services.module.css";

type Props = {
  pricing: ServicesPricing | null;
};

export default function Services({ pricing }: Props) {
  const t = useTranslations("services");
  const paths = pricing?.paths ?? [];
  const sectionTitleId = useId();

  const defaultPathId = useMemo(() => {
    if (paths.length === 0) return "";
    const def = paths.find((p) => p.isDefault) ?? paths[0];
    return def.id;
  }, [paths]);

  const [activePathId, setActivePathId] = useState<string>(defaultPathId);

  const activePath =
    paths.find((p) => p.id === activePathId) ?? paths[0] ?? null;

  const cancellation = pricing?.cancellationClause ?? null;
  const showCancellation =
    !!cancellation?.body && cancellation.showOnPathId === activePathId;

  const kicker = pricing?.kicker ?? t("kicker");
  const title = pricing?.title ?? t("title");
  const lead = pricing?.lead ?? t("lead");
  const defaultCtaLabel = t("defaultCta");

  return (
    <section
      id="servicios"
      aria-labelledby={sectionTitleId}
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>{kicker}</div>
        <h2 id={sectionTitleId} className={styles.heading}>
          {title}
        </h2>
        {lead && <p className={`lead ${styles.lead}`}>{lead}</p>}

        {paths.length > 1 && (
          <div className={styles.pathSelector}>
            {pricing?.pathSelectorLabel && (
              <span className={styles.pathSelectorLabel}>
                {pricing.pathSelectorLabel}
              </span>
            )}
            <div
              role="tablist"
              aria-label={t("pathTabsAriaLabel")}
              className={styles.pathTabs}
            >
              {paths.map((p) => {
                const isActive = p.id === activePathId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tier-panel-${p.id}`}
                    id={`tier-tab-${p.id}`}
                    className={`${styles.pathTab} ${
                      isActive ? styles.pathTabActive : ""
                    }`}
                    onClick={() => setActivePathId(p.id)}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            {activePath?.tagline && (
              <p className={styles.pathTagline}>{activePath.tagline}</p>
            )}
          </div>
        )}

        {activePath && (
          <div
            role="tabpanel"
            id={`tier-panel-${activePath.id}`}
            aria-labelledby={`tier-tab-${activePath.id}`}
            className={styles.grid}
          >
            {activePath.tiers.map((tier) => (
              <article
                key={`${activePath.id}-${tier.id}`}
                className={`${styles.card} ${
                  tier.highlighted ? styles.cardHighlighted : ""
                }`}
              >
                {tier.highlighted && tier.badge && (
                  <span className={styles.cardBadge}>{tier.badge}</span>
                )}

                <header className={styles.cardHeader}>
                  <p className={styles.cardName}>{tier.name}</p>
                  <p className={styles.cardPrice}>{tier.priceMain}</p>
                  <div className={styles.cardSub}>
                    {tier.priceSecondary && (
                      <span className={styles.cardPriceSecondary}>
                        {tier.priceSecondary}
                      </span>
                    )}
                    {tier.conditions && (
                      <span className={styles.cardConditions}>
                        {tier.conditions}
                      </span>
                    )}
                  </div>
                </header>

                {tier.features.length > 0 && (
                  <ul className={styles.featuresList}>
                    {tier.features.map((f, i) => (
                      <li
                        key={i}
                        className={`${styles.featureItem} ${
                          f.highlight ? styles.featureHighlight : ""
                        }`}
                      >
                        <span
                          className={styles.featureArrow}
                          aria-hidden="true"
                        >
                          {f.highlight ? "✦" : "→"}
                        </span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <a
                  href={tier.ctaHref || "#contacto"}
                  className={`${styles.cardCta} ${
                    tier.highlighted ? styles.cardCtaPrimary : ""
                  }`}
                >
                  {tier.ctaLabel || defaultCtaLabel} →
                </a>
              </article>
            ))}
          </div>
        )}

        {showCancellation && cancellation && (
          <aside className={styles.cancellation} aria-live="polite">
            {cancellation.label && (
              <div className={styles.cancellationLabel}>
                {cancellation.label}
              </div>
            )}
            <p className={styles.cancellationBody}>{cancellation.body}</p>
          </aside>
        )}

        {pricing?.migrationFootnote && (
          <p className={styles.footnote}>
            <span aria-hidden="true">*</span> {pricing.migrationFootnote}
          </p>
        )}

        {(pricing?.addOns?.length ?? 0) > 0 && (
          <div className={styles.addOnsBlock}>
            {pricing?.addOnsSectionTitle && (
              <h3 className={styles.addOnsTitle}>
                {pricing.addOnsSectionTitle}
              </h3>
            )}
            {pricing?.addOnsSectionLead && (
              <p className={styles.addOnsLead}>{pricing.addOnsSectionLead}</p>
            )}
            <ul className={styles.addOnsGrid}>
              {pricing!.addOns.map((a, i) => (
                <li key={i} className={styles.addOnCard}>
                  <p className={styles.addOnTitle}>{a.title}</p>
                  {a.price && <p className={styles.addOnPrice}>{a.price}</p>}
                  {a.note && <p className={styles.addOnNote}>{a.note}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
