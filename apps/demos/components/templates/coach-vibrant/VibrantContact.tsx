import type { DemoContact } from "@ebecerra/sanity-client";
import styles from "./VibrantContact.module.css";

/**
 * Contacto vibrant: NO form formal. Bloque grande con CTAs WhatsApp /
 * Instagram destacados. El avatar capta por DM, no por form.
 */
export default function VibrantContact({ contact }: { contact: DemoContact }) {
  const whatsapp = contact.social.find((s) => s.name === "WhatsApp");
  const instagram = contact.social.find((s) => s.name === "Instagram");
  const tiktok = contact.social.find((s) => s.name === "TikTok");

  return (
    <section id="contacto" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          {contact.kicker && <p className={styles.kicker}>{contact.kicker}</p>}
          <h2 id="contact-heading" className={styles.title}>
            {contact.title ?? "¿Empezamos?"}
          </h2>
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}
        </header>

        <div className={styles.channels}>
          {whatsapp?.url && (
            <a href={whatsapp.url} target="_blank" rel="noopener noreferrer" className={`${styles.channel} ${styles.channelWhatsapp}`}>
              <span className={styles.channelIcon} aria-hidden="true">💬</span>
              <span className={styles.channelLabel}>WhatsApp</span>
              <span className={styles.channelMeta}>Lo más rápido</span>
            </a>
          )}
          {instagram?.url && (
            <a href={instagram.url} target="_blank" rel="noopener noreferrer" className={`${styles.channel} ${styles.channelIg}`}>
              <span className={styles.channelIcon} aria-hidden="true">📷</span>
              <span className={styles.channelLabel}>Instagram DM</span>
              <span className={styles.channelMeta}>Donde vivo</span>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={`${styles.channel} ${styles.channelEmail}`}>
              <span className={styles.channelIcon} aria-hidden="true">✉</span>
              <span className={styles.channelLabel}>Email</span>
              <span className={styles.channelMeta}>{contact.email}</span>
            </a>
          )}
          {tiktok?.url && (
            <a href={tiktok.url} target="_blank" rel="noopener noreferrer" className={`${styles.channel} ${styles.channelTiktok}`}>
              <span className={styles.channelIcon} aria-hidden="true">🎵</span>
              <span className={styles.channelLabel}>TikTok</span>
              <span className={styles.channelMeta}>Contenido nuevo</span>
            </a>
          )}
        </div>

        {contact.hours.length > 0 && (
          <div className={styles.hours}>
            <p className={styles.hoursLabel}>Disponible:</p>
            <ul>
              {contact.hours.map((h, i) => (
                <li key={i}>
                  {h.label && <strong>{h.label}: </strong>}
                  {h.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
