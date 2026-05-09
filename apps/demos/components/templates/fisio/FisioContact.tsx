import { getTranslations } from "next-intl/server";
import type { DemoContact } from "@ebecerra/sanity-client";
import styles from "./FisioContact.module.css";

export default async function FisioContact({ contact }: { contact: DemoContact }) {
  const t = await getTranslations("fisio");

  return (
    <section
      id="contacto"
      className={styles.section}
      aria-labelledby="contact-heading"
    >
      <div className={styles.inner}>
        <div>
          {contact.kicker && <p className={styles.kicker}>{contact.kicker}</p>}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>
              {contact.title}
            </h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <ul className={styles.info}>
            {contact.address && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("addressLabel")}</span>
                <span className={styles.infoValue}>{contact.address}</span>
              </li>
            )}
            {contact.phone && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("phoneLabel")}</span>
                <span className={styles.infoValue}>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                    {contact.phone}
                  </a>
                </span>
              </li>
            )}
            {contact.email && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("emailLabel")}</span>
                <span className={styles.infoValue}>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </span>
              </li>
            )}
            {contact.hours.length > 0 && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>{t("openHours")}</span>
                <ul className={styles.hours}>
                  {contact.hours.map((row, i) => (
                    <li key={i} className={styles.hoursRow}>
                      <span className={styles.hoursLabel}>{row.label}</span>
                      <span className={styles.hoursValue}>{row.value}</span>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>

          {contact.bookingUrl && (
            <a
              href={contact.bookingUrl}
              className={styles.bookingCta}
              target="_blank"
              rel="noopener"
            >
              {t("callToAction")}
            </a>
          )}

          {contact.social.length > 0 && (
            <ul className={styles.social}>
              {contact.social.map(
                (s, i) =>
                  s.name &&
                  s.url && (
                    <li key={i}>
                      <a href={s.url} target="_blank" rel="noopener">
                        {s.name}
                      </a>
                    </li>
                  )
              )}
            </ul>
          )}
        </div>

        <div className={styles.map}>
          {contact.mapEmbedUrl ? (
            <iframe
              src={contact.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa"
            />
          ) : (
            <div className={styles.mapPlaceholder}>(Mapa pendiente)</div>
          )}
        </div>
      </div>
    </section>
  );
}
