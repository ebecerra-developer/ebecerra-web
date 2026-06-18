import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaTrustBar.module.css";

/**
 * Banda/marquee lento de sellos de confianza. Movimiento = modernidad,
 * contenido = autoridad (credenciales placeholder). Pausa en hover, respeta
 * prefers-reduced-motion (se detiene). El contenido real va al lector de
 * pantalla una sola vez (lista oculta); el marquee es aria-hidden.
 */
export default function GestoriaTrustBar({
  items,
  srLabel,
}: {
  items: string[];
  srLabel: string;
}) {
  const seq = [...items, ...items];

  return (
    <section className={styles.band} aria-label={srLabel}>
      {/* Versión accesible, una sola vez, sin duplicar */}
      <ul className={styles.srOnly}>
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>

      <div className={styles.viewport} aria-hidden="true">
        <div className={styles.track}>
          {seq.map((it, i) => (
            <span key={i} className={styles.item}>
              <GestoriaIcon name="check" className={styles.icon} />
              {it}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
