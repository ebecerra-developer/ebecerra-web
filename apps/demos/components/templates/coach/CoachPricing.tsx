import type { DemoSite, DemoPricingTier } from "@ebecerra/sanity-client";
import styles from "./CoachPricing.module.css";

/**
 * Tabla de precios pública en bonos (referencia: akromove.es).
 * Render condicional vía pricing.enabled. Mobile: cada modalidad como
 * card vertical. Desktop ≥ 900px: tabla matricial tiers × modalities.
 */
export default function CoachPricing({ demo }: { demo: DemoSite }) {
  const pricing = demo.pricing;
  if (!pricing?.enabled) return null;
  if (pricing.modalities.length === 0 || pricing.tiers.length === 0) return null;

  const eyebrowText = pricing.kicker?.replace(/^\/\/\s*/, "");

  return (
    <section
      id="precios"
      className={styles.section}
      aria-labelledby="pricing-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {eyebrowText && (
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{eyebrowText}</span>
              <span className={styles.eyebrowLine} />
            </p>
          )}
          {pricing.title && (
            <h2 id="pricing-heading" className={styles.title}>
              {pricing.title}
            </h2>
          )}
          {pricing.lead && <p className={styles.lead}>{pricing.lead}</p>}
        </header>

        {/* Desktop: tabla matricial */}
        <div className={styles.tableWrap} role="region" aria-label="Tabla de precios">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.thLabel}>Bono</th>
                {pricing.modalities.map((m) => (
                  <th key={m.id} scope="col" className={styles.th}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricing.tiers.map((tier, i) => (
                <tr key={i}>
                  <th scope="row" className={styles.tdRowLabel}>
                    <span className={styles.tierLabel}>{tier.label}</span>
                    <span className={styles.tierSessions}>
                      {tier.sessions} {tier.sessions === 1 ? "sesión" : "sesiones"}
                    </span>
                  </th>
                  {pricing.modalities.map((m) => {
                    const price = tier.prices.find((p) => p.modalityId === m.id);
                    return (
                      <td key={m.id} className={styles.td}>
                        {price ? (
                          <PriceCell amount={price.amount} perSession={price.perSession} />
                        ) : (
                          <span className={styles.priceEmpty}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards apiladas por modalidad */}
        <div className={styles.cardsMobile}>
          {pricing.modalities.map((m) => (
            <article key={m.id} className={styles.modalityCard}>
              <h3 className={styles.modalityTitle}>{m.label}</h3>
              <ul className={styles.tierList}>
                {pricing.tiers.map((tier, i) => {
                  const price = tier.prices.find((p) => p.modalityId === m.id);
                  if (!price) return null;
                  return <TierRow key={i} tier={tier} amount={price.amount} perSession={price.perSession} />;
                })}
              </ul>
            </article>
          ))}
        </div>

        {pricing.note && <p className={styles.note}>{pricing.note}</p>}
      </div>
    </section>
  );
}

function PriceCell({ amount, perSession }: { amount: number; perSession: number | null }) {
  return (
    <div className={styles.priceCell}>
      <span className={styles.priceAmount}>{amount}€</span>
      {perSession != null && perSession > 0 && (
        <span className={styles.pricePer}>{perSession}€/sesión</span>
      )}
    </div>
  );
}

function TierRow({
  tier,
  amount,
  perSession,
}: {
  tier: DemoPricingTier;
  amount: number;
  perSession: number | null;
}) {
  return (
    <li className={styles.tierRow}>
      <div>
        <p className={styles.tierLabel}>{tier.label}</p>
        <p className={styles.tierSessions}>
          {tier.sessions} {tier.sessions === 1 ? "sesión" : "sesiones"}
        </p>
      </div>
      <PriceCell amount={amount} perSession={perSession} />
    </li>
  );
}
