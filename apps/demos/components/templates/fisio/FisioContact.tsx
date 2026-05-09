import { getTranslations } from "next-intl/server";
import type { DemoContact } from "@ebecerra/sanity-client";
import styles from "./FisioContact.module.css";

export default async function FisioContact({ contact }: { contact: DemoContact }) {
  const t = await getTranslations("fisio");
  const ctaLabel = t("callToAction");
  const ctaHref = contact.bookingUrl ?? `mailto:${contact.email ?? ""}`;

  return (
    <section
      id="contacto"
      className={styles.section}
      aria-labelledby="contact-heading"
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          {contact.kicker && (
            <p className={styles.sectionIndex}>
              <span className={styles.indexNumber}>05</span>
              <span>{contact.kicker.replace(/^\/\/\s*/, "")}</span>
            </p>
          )}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>
              {contact.title}
            </h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          {(contact.bookingUrl || contact.email) && (
            <a
              href={ctaHref}
              className={styles.bookingCta}
              {...(contact.bookingUrl
                ? { target: "_blank", rel: "noopener" }
                : {})}
            >
              {ctaLabel}
            </a>
          )}

          {contact.social.length > 0 && (
            <div className={styles.social}>
              {contact.social.map(
                (s, i) =>
                  s.name &&
                  s.url && (
                    <a
                      key={i}
                      href={s.url}
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener"
                    >
                      {s.name} ↗
                    </a>
                  )
              )}
            </div>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.infoGrid}>
            {contact.address && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>{t("addressLabel")}</span>
                <span className={styles.infoValue}>{contact.address}</span>
              </div>
            )}
            {contact.phone && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>{t("phoneLabel")}</span>
                <span className={styles.infoValue}>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                    {contact.phone}
                  </a>
                </span>
              </div>
            )}
            {contact.email && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>{t("emailLabel")}</span>
                <span className={styles.infoValue}>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </span>
              </div>
            )}
            {contact.hours.length > 0 && (
              <div className={styles.infoBlock}>
                <span className={styles.infoLabel}>{t("openHours")}</span>
                <ul className={styles.hours}>
                  {contact.hours.map((row, i) => (
                    <li key={i} className={styles.hoursRow}>
                      <span className={styles.hoursLabel}>{row.label}</span>
                      <span className={styles.hoursValue}>{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {contact.mapEmbedUrl && (
            <div className={styles.map}>
              <iframe
                src={contact.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
