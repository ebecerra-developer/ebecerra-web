import type { DemoContact, DemoService } from "@ebecerra/sanity-client";
import FisioContactForm from "../fisio/FisioContactForm";
import styles from "./EditorialContact.module.css";

/**
 * Contacto editorial: bloque sobrio dos columnas. Izquierda info de
 * contacto + redes en formato magazine. Derecha form (reusa lógica
 * FisioContactForm pero con estilos editoriales aplicados via :global).
 */
export default function EditorialContact({
  contact,
  services,
}: {
  contact: DemoContact;
  services: DemoService[];
}) {
  return (
    <section id="contacto" className={styles.section} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <div className={styles.left}>
          {contact.kicker && <p className={styles.kicker}>{contact.kicker}</p>}
          {contact.title && (
            <h2 id="contact-heading" className={styles.title}>{contact.title}</h2>
          )}
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <dl className={styles.infoList}>
            {contact.email && (
              <>
                <dt>Email</dt>
                <dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd>
              </>
            )}
            {contact.phone && (
              <>
                <dt>Teléfono</dt>
                <dd><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></dd>
              </>
            )}
            {contact.address && (
              <>
                <dt>Estudio</dt>
                <dd>{contact.address}</dd>
              </>
            )}
            {contact.hours.length > 0 && (
              <>
                <dt>Horario</dt>
                <dd>
                  <ul className={styles.hoursList}>
                    {contact.hours.map((h, i) => (
                      <li key={i}>
                        {h.label && <span className={styles.hoursLabel}>{h.label}: </span>}
                        {h.value}
                      </li>
                    ))}
                  </ul>
                </dd>
              </>
            )}
            {contact.social.length > 0 && (
              <>
                <dt>En redes</dt>
                <dd>
                  <ul className={styles.socialList}>
                    {contact.social.map((s, i) => (
                      s.url && s.name ? (
                        <li key={i}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
                        </li>
                      ) : null
                    ))}
                  </ul>
                </dd>
              </>
            )}
          </dl>
        </div>

        <div className={styles.right}>
          <div className={styles.formWrap}>
            <FisioContactForm serviceOptions={services.map((s) => s.title)} />
          </div>
        </div>
      </div>
    </section>
  );
}
