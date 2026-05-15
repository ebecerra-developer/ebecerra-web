import styles from "./PostCoverFallback.module.css";

type Props = {
  title: string;
  category?: string | null;
  /** "card" para la card del listado (compacta), "hero" para la cabecera del post (grande). */
  variant?: "card" | "hero";
};

/**
 * Fallback cuando el post no tiene coverImage subida en Sanity.
 * Genera un "cover" visual con CSS — mismo lenguaje que la OG image dinámica
 * (categoría arriba, título grande, branding al pie). Sin fetch de imagen.
 */
export default function PostCoverFallback({
  title,
  category,
  variant = "card",
}: Props) {
  return (
    <div
      className={styles.cover}
      data-variant={variant}
      aria-hidden
    >
      {category && <div className={styles.category}>{category}</div>}
      <div className={styles.title}>{title}</div>
      <div className={styles.brand}>
        <span className={styles.brandDomain}>ebecerra.es/blog</span>
        <span className={styles.brandMark}>eB</span>
      </div>
    </div>
  );
}
