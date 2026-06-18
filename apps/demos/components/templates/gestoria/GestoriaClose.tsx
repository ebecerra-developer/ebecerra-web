import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaClose.module.css";

/**
 * Cierre del arco narrativo: el caos del hero ya resuelto. Banda marino,
 * mensaje de puro alivio y el estado de plazos ahora en verde "al día". Cierra
 * la historia caos → 3 pasos → tranquilidad.
 */
export default function GestoriaClose({ content }: { content: GestoriaContent }) {
  const c = content.close;

  return (
    <section className={styles.section} aria-labelledby="close-heading">
      <div className={styles.inner}>
        <p className={styles.kicker}>{c.kicker}</p>
        <h2 id="close-heading" className={styles.heading}>
          {c.heading}
        </h2>
        <p className={styles.body}>{c.body}</p>

        <div className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true">
            <GestoriaIcon name="check" className={styles.statusCheck} />
          </span>
          {c.statusLabel}
        </div>

        <div className={styles.ctas}>
          <a href="#contacto" className={styles.ctaPrimary}>
            {c.ctaPrimary}
          </a>
          <a href={`tel:${content.phone.tel}`} className={styles.ctaSecondary}>
            <GestoriaIcon name="phone" className={styles.ctaIcon} />
            {c.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
