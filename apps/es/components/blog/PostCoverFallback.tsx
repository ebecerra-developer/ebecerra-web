import styles from "./PostCoverFallback.module.css";

type Props = {
  /** "card" para la card del listado, "hero" para la cabecera del post. */
  variant?: "card" | "hero";
};

/**
 * Fallback cuando el post no tiene coverImage subida en Sanity.
 *
 * Diseño puramente visual — NO repite título ni categoría (esos viven en el
 * body de la card / header del post). Solo reserva el espacio con una textura
 * de marca (gradiente + monograma eB), para que el editor pueda subir la
 * imagen real cuando quiera sin que el layout cambie.
 */
export default function PostCoverFallback({ variant = "card" }: Props) {
  return (
    <div className={styles.cover} data-variant={variant} aria-hidden>
      <span className={styles.mark}>eB</span>
    </div>
  );
}
