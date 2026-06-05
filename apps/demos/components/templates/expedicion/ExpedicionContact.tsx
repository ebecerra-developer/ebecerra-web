import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import ExpedicionContactForm from "./ExpedicionContactForm";
import styles from "./ExpedicionContact.module.css";

type Contact = NonNullable<DemoSite["contact"]>;
type Services = DemoSite["services"];

export default function ExpedicionContact({
  contact,
  services,
  locale,
}: {
  contact: Contact;
  services: Services;
  locale: Locale;
}) {
  const es = locale === "es";
  const serviceOptions = services
    .map((s) => s.title)
    .filter((t): t is string => !!t);

  return (
    <section id="contacto" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.info}>
          {contact.kicker && <p className={styles.kicker}>{contact.kicker}</p>}
          <h2 className={styles.title}>
            {contact.title ?? (es ? "Reserva tu ruta" : "Book your route")}
          </h2>
          {contact.lead && <p className={styles.lead}>{contact.lead}</p>}

          <dl className={styles.details}>
            {contact.address && (
              <div className={styles.detail}>
                <dt className={styles.detailLabel}>
                  {es ? "Punto de encuentro" : "Meeting point"}
                </dt>
                <dd className={styles.detailValue}>{contact.address}</dd>
              </div>
            )}
            {contact.phone && (
              <div className={styles.detail}>
                <dt className={styles.detailLabel}>
                  {es ? "Teléfono" : "Phone"}
                </dt>
                <dd className={styles.detailValue}>
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                    {contact.phone}
                  </a>
                </dd>
              </div>
            )}
            {contact.email && (
              <div className={styles.detail}>
                <dt className={styles.detailLabel}>Email</dt>
                <dd className={styles.detailValue}>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
            )}
            {contact.hours.length > 0 && (
              <div className={styles.detail}>
                <dt className={styles.detailLabel}>
                  {es ? "Temporada" : "Season"}
                </dt>
                <dd className={styles.detailValue}>
                  <ul className={styles.hours}>
                    {contact.hours.map((h, i) => (
                      <li key={i}>
                        {h.label && <span>{h.label}: </span>}
                        {h.value}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {contact.social.length > 0 && (
            <ul className={styles.social}>
              {contact.social.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ExpedicionContactForm
          serviceOptions={serviceOptions}
          bookingUrl={contact.bookingUrl ?? null}
          locale={locale}
        />
      </div>
    </section>
  );
}
