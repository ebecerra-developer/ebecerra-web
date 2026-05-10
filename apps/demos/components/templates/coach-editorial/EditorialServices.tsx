import Image from "next/image";
import type { DemoSectionHeader, DemoService } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./EditorialServices.module.css";

/**
 * Servicios como lista índice editorial. Cada servicio = fila con número
 * romano + título serif grande + descripción + (opcional) imagen lifestyle
 * a la derecha. Sin grid de cards iguales — formato magazine.
 */
export default function EditorialServices({
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
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="services-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ol className={styles.list}>
          {services.map((service, i) => {
            const num = String(i + 1).padStart(2, "0");
            const imgUrl = service.image
              ? urlFor(service.image).width(900).height(700).auto("format").url()
              : null;
            return (
              <li key={i} className={styles.item}>
                <div className={styles.itemMain}>
                  <span className={styles.itemNum}>{num}</span>
                  <div className={styles.itemBody}>
                    <h3 className={styles.itemTitle}>{service.title}</h3>
                    {service.description && (
                      <p className={styles.itemDesc}>{service.description}</p>
                    )}
                    <dl className={styles.itemMeta}>
                      {service.duration && (
                        <>
                          <dt>Duración</dt>
                          <dd>{service.duration}</dd>
                        </>
                      )}
                      {service.price && (
                        <>
                          <dt>Inversión</dt>
                          <dd>{service.price}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                </div>
                {imgUrl && (
                  <div className={styles.itemImage}>
                    <Image src={imgUrl} alt="" fill sizes="(min-width: 1000px) 30vw, 100vw" className={styles.image} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
