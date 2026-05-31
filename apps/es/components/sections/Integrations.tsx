import { urlFor } from "@/lib/sanity-image";
import type { IntegrationsStrip } from "@ebecerra/sanity-client";
import styles from "./Integrations.module.css";

type Props = {
  data: IntegrationsStrip;
};

// Franja de herramientas con las que trabajo / me integro. Señal de confianza
// para PYMEs. Todo el contenido (heading + logos) viene de Sanity; si no hay
// items o está deshabilitado, la sección no se renderiza.
export default function Integrations({ data }: Props) {
  if (!data?.enabled || !data.items?.length) return null;

  return (
    <section
      aria-label={data.heading ?? "Integraciones"}
      className={styles.section}
    >
      <div className={styles.inner}>
        {data.heading && <p className={styles.heading}>{data.heading}</p>}
        <ul className={styles.logos}>
          {data.items.map((item, i) => {
            if (!item.logo) return null;
            const src = urlFor(item.logo).url();
            const alt = item.logo.alt ?? item.name;
            const img = (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={alt}
                title={item.name}
                loading="lazy"
                decoding="async"
                className={styles.logo}
              />
            );
            return (
              <li key={`${item.name}-${i}`} className={styles.logoItem}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.logoLink}
                    aria-label={item.name}
                  >
                    {img}
                  </a>
                ) : (
                  img
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
