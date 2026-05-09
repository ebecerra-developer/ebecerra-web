import type { DemoSectionHeader, DemoService } from "@ebecerra/sanity-client";
import styles from "./FisioServices.module.css";

export default function FisioServices({
  header,
  services,
}: {
  header: DemoSectionHeader | null;
  services: DemoService[];
}) {
  return (
    <section
      id="servicios"
      className={styles.section}
      aria-labelledby="services-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            {header?.kicker && (
              <p className={styles.sectionIndex}>
                <span className={styles.indexNumber}>02</span>
                <span>{header.kicker.replace(/^\/\/\s*/, "")}</span>
              </p>
            )}
            {header?.title && (
              <h2 id="services-heading" className={styles.title}>
                {header.title}
              </h2>
            )}
          </div>
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {services.map((service, i) => (
            <li key={i} className={styles.card}>
              <p className={styles.cardIndex}>
                {String(i + 1).padStart(2, "0")} ·{" "}
                {service.duration ?? ""}
              </p>
              {service.icon && <span className={styles.icon}>{service.icon}</span>}
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              {service.description && (
                <p className={styles.serviceDesc}>{service.description}</p>
              )}
              {service.duration && (
                <div className={styles.meta}>{service.duration}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
