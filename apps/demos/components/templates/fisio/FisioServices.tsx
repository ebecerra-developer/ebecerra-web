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
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="services-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {services.map((service, i) => (
            <li key={i} className={styles.card}>
              {service.icon && <span className={styles.icon}>{service.icon}</span>}
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              {service.description && (
                <p className={styles.serviceDesc}>{service.description}</p>
              )}
              <div className={styles.meta}>
                {service.duration && (
                  <span className={styles.metaItem}>{service.duration}</span>
                )}
                {service.price && <span className={styles.price}>{service.price}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
