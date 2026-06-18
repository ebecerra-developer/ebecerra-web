import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import GestoriaContactForm from "./GestoriaContactForm";
import styles from "./GestoriaContact.module.css";

/**
 * Contacto: teléfono y WhatsApp clicables, email con dominio propio, despacho
 * físico + "mapa" (placeholder, no se carga iframe externo en la demo) +
 * horario + nota de atención remota + confidencialidad, y el formulario corto.
 */
export default function GestoriaContact({ content }: { content: GestoriaContent }) {
  const c = content.contact;

  return (
    <section id="contacto" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <div className={styles.left}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {c.kicker}
          </p>
          <h2 id="contact-heading" className={styles.title}>
            {c.title}
          </h2>
          <p className={styles.lead}>{c.lead}</p>

          <div className={styles.channels}>
            <a href={`tel:${content.phone.tel}`} className={styles.channelPrimary}>
              <GestoriaIcon name="phone" className={styles.channelIcon} />
              <span>
                <span className={styles.channelLabel}>{c.callLabel}</span>
                <span className={styles.channelValue}>{content.phone.display}</span>
              </span>
            </a>
            <a
              href={content.whatsapp.href}
              className={styles.channelWa}
              target="_blank"
              rel="noopener"
            >
              <GestoriaIcon name="chat" className={styles.channelIcon} />
              {c.waLabel}
            </a>
          </div>

          <a href={`mailto:${content.email}`} className={styles.email}>
            <GestoriaIcon name="doc" className={styles.emailIcon} />
            {content.email}
          </a>

          <div className={styles.info}>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>{c.addressTitle}</h3>
              <address className={styles.address}>
                {c.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <p className={styles.remote}>{c.remoteNote}</p>
            </div>
            <div className={styles.infoBlock}>
              <h3 className={styles.infoTitle}>{c.hoursTitle}</h3>
              <ul className={styles.hours}>
                {c.hours.map((h) => (
                  <li key={h.label} className={styles.hoursRow}>
                    <span className={styles.hoursLabel}>{h.label}</span>
                    <span className={styles.hoursValue}>{h.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.map} role="img" aria-label={c.mapLabel}>
            <span className={styles.mapGrid} aria-hidden="true" />
            <span className={styles.mapPin} aria-hidden="true">
              <GestoriaIcon name="herencia" className={styles.mapPinIcon} />
            </span>
            <span className={styles.mapNote}>{c.mapLabel}</span>
          </div>

          <p className={styles.confidential}>
            <GestoriaIcon name="shield" className={styles.confIcon} />
            {c.confidentiality}
          </p>
        </div>

        <div className={styles.right}>
          <GestoriaContactForm form={c.form} />
        </div>
      </div>
    </section>
  );
}
