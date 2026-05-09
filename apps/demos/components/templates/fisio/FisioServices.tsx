import type { DemoSectionHeader, DemoService } from "@ebecerra/sanity-client";
import styles from "./FisioServices.module.css";

export default function FisioServices({
  header,
  services,
}: {
  header: DemoSectionHeader | null;
  services: DemoService[];
}) {
  const eyebrowText = header?.kicker?.replace(/^\/\/\s*/, "");

  return (
    <section
      id="servicios"
      className={styles.section}
      aria-labelledby="services-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {eyebrowText && (
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{eyebrowText}</span>
              <span className={styles.eyebrowLine} />
            </p>
          )}
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
              {service.icon && (
                <div className={styles.iconWrap}>
                  <span className={styles.icon}>{service.icon}</span>
                </div>
              )}
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              {service.description && (
                <p className={styles.serviceDesc}>{service.description}</p>
              )}
              {service.duration && (
                <span className={styles.duration}>
                  <span className={styles.durationDot} aria-hidden="true" />
                  {service.duration}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
