"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "./commerce";
import { formatEUR, getPriceInfo } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import Icon from "./Icon";
import styles from "./ProductCard.module.css";

export default function ProductCard({
  product,
  content,
}: {
  product: Product;
  content: TiendaContent;
}) {
  const { addItem, busy } = useCart();
  const { catalog } = content;
  const price = getPriceInfo(product);
  const [justAdded, setJustAdded] = useState(false);
  const href = routes.product(product.handle);

  const handleAdd = async () => {
    if (price.fromMultiple) return; // varios formatos → se elige en la ficha
    await addItem(product.variants[0].id, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.media} aria-label={product.title}>
        {price.onSale && (
          <span className={styles.offer}>
            {price.discountPct ? `-${price.discountPct}%` : catalog.offerTag}
          </span>
        )}
        <ProductImage product={product} />
      </Link>

      <div className={styles.body}>
        <p className={styles.unit}>{product.unit}</p>
        <h3 className={styles.title}>
          <Link href={href} className={styles.titleLink}>
            {product.title}
          </Link>
        </h3>

        <div className={styles.footer}>
          <div className={styles.prices}>
            <span className={styles.price} data-sale={price.onSale}>
              {price.fromMultiple && (
                <span className={styles.from}>{catalog.fromLabel} </span>
              )}
              {formatEUR(price.amount)}
            </span>
            {price.onSale && price.original != null && (
              <span className={styles.original}>{formatEUR(price.original)}</span>
            )}
          </div>

          {price.fromMultiple ? (
            <Link href={href} className={styles.chooseBtn}>
              {catalog.addLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={styles.addBtn}
              onClick={handleAdd}
              disabled={busy}
              data-added={justAdded}
              aria-label={`${catalog.addLabel} ${product.title}`}
            >
              <Icon name={justAdded ? "check" : "plus"} size={18} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
