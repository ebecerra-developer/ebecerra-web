import type { DemoContact } from "@ebecerra/sanity-client";
import FisioContactForm from "../fisio/FisioContactForm";
import styles from "./BeeMovementContact.module.css";

export default function BeeMovementContact({ contact }: { contact: DemoContact }) {
  const whatsapp = contact.social.find((s) => s.name === "WhatsApp");
  const instagram = contact.social.find((s) => s.name === "Instagram");

  return (
    <section id="contacto" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <div className={styles.left}>
          {contact.kicker && <p className={styles.eyebrow}>{contact.kicker}</p>}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>
              {contact.title}
            </h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <div className={styles.channels}>
            {whatsapp?.url && (
              <a
                href={whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channel}
              >
                <span className={`${styles.channelIcon} ${styles.channelIconWhatsapp}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.86.51 3.677 1.475 5.263L2 22l4.865-1.446a10.03 10.03 0 0 0 5.139 1.412h.004c5.526 0 10.004-4.478 10.004-10.004C22 6.478 17.53 2 12.004 2zm0 18.166a8.14 8.14 0 0 1-4.163-1.14l-.298-.177-2.888.858.865-2.816-.194-.29a8.15 8.15 0 0 1-1.264-4.363c0-4.51 3.669-8.18 8.18-8.18a8.13 8.13 0 0 1 5.786 2.397 8.13 8.13 0 0 1 2.393 5.786c0 4.512-3.669 8.18-8.417 8.18z" />
                  </svg>
                </span>
                <span className={styles.channelText}>
                  <span className={styles.channelLabel}>WhatsApp</span>
                  <span className={styles.channelMeta}>Respuesta rápida</span>
                </span>
              </a>
            )}
            {instagram?.url && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channel}
              >
                <span className={`${styles.channelIcon} ${styles.channelIconInstagram}`} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <span className={styles.channelText}>
                  <span className={styles.channelLabel}>Instagram</span>
                  <span className={styles.channelMeta}>@beemovementfisio</span>
                </span>
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                className={styles.channel}
              >
                <span className={`${styles.channelIcon} ${styles.channelIconCall}`} aria-hidden="true">
                  ☎
                </span>
                <span className={styles.channelText}>
                  <span className={styles.channelLabel}>Llamar</span>
                  <span className={styles.channelMeta}>{contact.phone}</span>
                </span>
              </a>
            )}
          </div>

          <ul className={styles.infoList}>
            {contact.address && (
              <li className={styles.infoRow}>
                <span className={styles.infoIcon} aria-hidden="true">
                  📍
                </span>
                <span className={styles.infoText}>{contact.address}</span>
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

          {contact.mapEmbedUrl && (
            <div className={styles.mapWrap}>
              <iframe
                src={contact.mapEmbedUrl}
                title="Mapa: cómo llegar a Espacio BeeMovement"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        <div className={styles.right}>
          <FisioContactForm />
        </div>
      </div>
    </section>
  );
}
