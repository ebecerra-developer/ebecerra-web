import { urlFor } from "@/lib/sanity-image";
import type { IntegrationsStrip } from "@ebecerra/sanity-client";
import styles from "./Integrations.module.css";

type Props = {
  data: IntegrationsStrip;
};

// Bloque de logos de herramientas que integro. Se embebe al final de la sección
// Capacidades (mismo fondo). Contenido editable en Sanity (integrationsStrip).
export default function Integrations({ data }: Props) {
  if (!data?.enabled || !data.items?.length) return null;

  return (
    <div className={styles.embed} aria-label={data.heading ?? "Integraciones"}>
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
  );
}
