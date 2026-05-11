import type { DemoContact, DemoService } from "@ebecerra/sanity-client";
import TandemContactForm from "./TandemContactForm";
import styles from "./TandemContact.module.css";

export default function TandemContact({
  contact,
  services,
}: {
  contact: DemoContact;
  services: DemoService[];
}) {
  const serviceOptions = services.map((s) => s.title);

  return (
    <section
      id="contacto"
      className={styles.section}
      aria-labelledby="contact-heading"
    >
      <div className={styles.inner}>
        <div className={styles.intro}>
          {contact.kicker && <p className={styles.kicker}>{contact.kicker}</p>}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>
              {contact.title}
            </h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <ul className={styles.info}>
            {contact.email && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <a
                  href={`mailto:${contact.email}`}
                  className={styles.infoValue}
                >
                  {contact.email}
                </a>
              </li>
            )}
            {contact.phone && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>Teléfono</span>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className={styles.infoValue}
                >
                  {contact.phone}
                </a>
              </li>
            )}
            {contact.address && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>Dónde</span>
                <span className={styles.infoValue}>{contact.address}</span>
              </li>
            )}
            {contact.social.length > 0 && (
              <li className={styles.infoItem}>
                <span className={styles.infoLabel}>Redes</span>
                <span className={styles.socials}>
                  {contact.social.map(
                    (s, i) =>
                      s.url &&
                      s.name && (
                        <a
                          key={i}
                          href={s.url}
                          className={styles.social}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.name}
                        </a>
                      )
                  )}
                </span>
              </li>
            )}
          </ul>
        </div>

        <div className={styles.formWrap}>
          <TandemContactForm serviceOptions={serviceOptions} />
        </div>
      </div>
    </section>
  );
}
