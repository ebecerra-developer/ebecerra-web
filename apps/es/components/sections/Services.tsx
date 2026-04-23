import { getTranslations } from "next-intl/server";
import type { Service } from "@ebecerra/sanity-client";
import styles from "./Services.module.css";

type Props = {
  services: Service[];
};

export default async function Services({ services }: Props) {
  const t = await getTranslations("services");

  return (
    <section
      id="servicios"
      aria-labelledby="services-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>
          //{" "}
          <span className={styles.kickerAccent}>01.</span>{" "}
          {t("kicker").replace(/^\/\/\s*01\.\s*/i, "")}
        </div>
        <h2 id="services-heading" className={styles.heading}>
          {t("title")}
        </h2>
        <p className={`lead ${styles.lead}`}>
          {t("lead")}
        </p>

        <div className={styles.grid}>
          {services.map((service, index) => (
            <article key={service._id} className={styles.card}>
              <div className={styles.cardIndex}>
                // {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className={styles.cardTitle}>{service.title}</h3>
              <p className={styles.cardSummary}>{service.summary}</p>

              {service.deliverables.length > 0 && (
                <ul className={styles.deliverablesList}>
                  {service.deliverables.map((item) => (
                    <li key={item} className={styles.deliverableItem}>
                      <span className={styles.deliverableArrow}>→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className={styles.cardFooter}>
                <div className={styles.priceBlock}>
                  {service.priceRange && (
                    <span className={styles.priceRange}>
                      {t("priceFrom")} {service.priceRange}
                    </span>
                  )}
                  {service.priceNote && (
                    <span className={styles.priceNote}>{service.priceNote}</span>
                  )}
                </div>
                <a href="#contacto" className={styles.viewMore}>
                  {t("viewMore")} →
                </a>
              </div>
            </article>
          ))}
        </div>

        <aside
          className={styles.audit}
          aria-labelledby="services-audit-heading"
        >
          <div className={styles.auditBody}>
            <div className={styles.auditKicker}>// {t("auditKicker")}</div>
            <p id="services-audit-heading" className={styles.auditText}>
              {t("auditBody")}
            </p>
          </div>
          <a href="#contacto" className={styles.auditCta}>
            {t("auditCta")} →
          </a>
        </aside>
      </div>
    </section>
  );
}
