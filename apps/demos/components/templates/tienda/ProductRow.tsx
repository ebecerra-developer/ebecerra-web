import Link from "next/link";
import type { Product } from "./commerce";
import type { TiendaContent } from "./content";
import ProductCard from "./ProductCard";
import Icon from "./Icon";
import styles from "./ProductRow.module.css";

/**
 * Fila de productos con cabecera (título + subtítulo + "ver todo"). En móvil
 * scroll horizontal; en desktop grid. Se reutiliza para ofertas, destacados y
 * recomendados en la home.
 */
export default function ProductRow({
  title,
  sub,
  ctaLabel,
  ctaHref,
  products,
  content,
  accent,
}: {
  title: string;
  sub?: string;
  ctaLabel?: string;
  ctaHref?: string;
  products: Product[];
  content: TiendaContent;
  accent?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section className={styles.section} data-accent={accent}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {sub && <p className={styles.sub}>{sub}</p>}
          </div>
          {ctaHref && ctaLabel && (
            <Link href={ctaHref} className={styles.cta}>
              {ctaLabel}
              <Icon name="chevronRight" size={16} strokeWidth={2} />
            </Link>
          )}
        </header>

        <ul className={styles.row}>
          {products.map((p) => (
            <li key={p.id} className={styles.item}>
              <ProductCard product={p} content={content} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
