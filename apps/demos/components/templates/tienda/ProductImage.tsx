import type { Product } from "./commerce";
import { CATEGORY_ICON } from "./commerce";
import Icon, { type IconName } from "./Icon";
import styles from "./ProductImage.module.css";

/**
 * Imagen de producto. Muestra la foto real (asset de Sanity) si existe; si no,
 * un placeholder limpio con el icono de la categoría (sin emoji). Cuando se
 * generen todas las fotos, el placeholder deja de aparecer.
 */
export default function ProductImage({
  product,
  className,
  sizes,
}: {
  product: Product;
  className?: string;
  sizes?: "card" | "detail";
}) {
  const src = product.thumbnail;
  const iconName = (CATEGORY_ICON[product.categories[0]?.handle] ??
    "cart") as IconName;

  return (
    <div className={`${styles.frame} ${className ?? ""}`}>
      {src ? (
        <img
          src={src}
          alt={product.title}
          className={styles.img}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <Icon name={iconName} size={sizes === "detail" ? 64 : 40} strokeWidth={1.4} />
        </div>
      )}
    </div>
  );
}
