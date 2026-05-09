import type { DemoContact, DemoService } from "@ebecerra/sanity-client";
import FisioContactForm from "./FisioContactForm";
import styles from "./FisioContact.module.css";

export default function FisioContact({
  contact,
  services,
}: {
  contact: DemoContact;
  services: DemoService[];
}) {
  const eyebrowText = contact.kicker?.replace(/^\/\/\s*/, "");
  const serviceTitles = services.map((s) => s.title);

  return (
    <section
      id="contacto"
      className={styles.section}
      aria-labelledby="contact-heading"
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          {eyebrowText && (
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{eyebrowText}</span>
            </p>
          )}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>
              {contact.title}
            </h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <ul className={styles.infoList}>
            {contact.address && (
              <li className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden="true">
                  📍
                </span>
                <span className={styles.infoText}>{contact.address}</span>
              </li>
            )}
            {contact.phone && (
              <li className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden="true">
                  ☎
                </span>
                <span className={styles.infoText}>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                    {contact.phone}
                  </a>
                </span>
              </li>
            )}
            {contact.email && (
              <li className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden="true">
                  ✉
                </span>
                <span className={styles.infoText}>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </span>
              </li>
            )}
            {contact.hours.length > 0 && (
              <li className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden="true">
                  🕐
                </span>
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
          <FisioContactForm serviceOptions={serviceTitles} />
        </div>
      </div>
    </section>
  );
}
