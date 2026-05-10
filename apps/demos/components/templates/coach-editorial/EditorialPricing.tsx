import type { DemoPricing } from "@ebecerra/sanity-client";
import styles from "./EditorialPricing.module.css";

export default function EditorialPricing({ pricing }: { pricing: DemoPricing }) {
  if (pricing.modalities.length === 0 || pricing.tiers.length === 0) return null;

  return (
    <section id="tarifas" className={styles.section} aria-labelledby="pricing-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          {pricing.kicker && <p className={styles.kicker}>{pricing.kicker}</p>}
          {pricing.title && (
            <h2 id="pricing-heading" className={styles.title}>{pricing.title}</h2>
          )}
          {pricing.lead && <p className={styles.lead}>{pricing.lead}</p>}
        </header>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.thLabel}></th>
                {pricing.modalities.map((m) => (
                  <th key={m.id} scope="col" className={styles.th}>{m.label}</th>
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
                          <div className={styles.priceCell}>
                            <span className={styles.priceAmount}>{price.amount}€</span>
                            {price.perSession != null && price.perSession > 0 && (
                              <span className={styles.pricePer}>{price.perSession}€/sesión</span>
                            )}
                          </div>
                        ) : <span>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pricing.note && <p className={styles.note}>{pricing.note}</p>}
      </div>
    </section>
  );
}
