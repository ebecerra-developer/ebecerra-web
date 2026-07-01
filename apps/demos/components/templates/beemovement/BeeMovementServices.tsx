import Image from "next/image";
import type { DemoSectionHeader, DemoService } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./BeeMovementServices.module.css";

/**
 * Tinte de imagen rotando sobre los 3 colores reales de las sillas de la
 * sala de espera (mostaza/rosa empolvado/verde) — el único sitio donde esa
 * seña de identidad física entra en la UI, a modo de guiño puntual.
 */
const TINTS = [styles.tintMustard, styles.tintRose, styles.tintForest];

export default function BeeMovementServices({
  header,
  services,
}: {
  header: DemoSectionHeader | null;
  services: DemoService[];
}) {
  return (
    <section id="servicios" className={styles.section} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          {header?.kicker && <p className={styles.eyebrow}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="services-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {services.map((service, i) => {
            const imageUrl = service.image
              ? urlFor(service.image).width(480).height(320).auto("format").url()
              : null;
            return (
              <li key={i} className={styles.card}>
                <div className={`${styles.media} ${TINTS[i % TINTS.length]}`}>
                  {imageUrl ? (
                    <Image src={imageUrl} alt="" fill sizes="(min-width: 1024px) 380px, 90vw" />
                  ) : (
                    service.icon && (
                      <span className={styles.icon} aria-hidden="true">
                        {service.icon}
                      </span>
                    )
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  {service.description && (
                    <p className={styles.serviceDesc}>{service.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
