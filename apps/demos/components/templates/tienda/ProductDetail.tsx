"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "./commerce";
import { formatEUR } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import ProductImage from "./ProductImage";
import ProductCard from "./ProductCard";
import Icon from "./Icon";
import styles from "./ProductDetail.module.css";

export default function ProductDetail({
  content,
  product,
  related,
}: {
  content: TiendaContent;
  product: Product;
  related: Product[];
}) {
  const { addItem, busy } = useCart();
  const t = content.product;
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const hasOptions = product.variants.length > 1;
  const amount = variant.calculated_price.calculated_amount;
  const original = variant.calculated_price.original_amount ?? null;
  const onSale = original != null && original > amount;
  const category = product.categories[0];

  const handleAdd = async () => {
    await addItem(variant.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Migas">
          <Link href={routes.home()}>{t.home}</Link>
          <Icon name="chevronRight" size={14} strokeWidth={2} />
          {category && (
            <>
              <Link href={routes.category(category.handle)}>{category.name}</Link>
              <Icon name="chevronRight" size={14} strokeWidth={2} />
            </>
          )}
          <span>{product.title}</span>
        </nav>

        <div className={styles.detail}>
          <div className={styles.media}>
            {onSale && <span className={styles.saleTag}>{content.catalog.offerTag}</span>}
            <ProductImage product={product} sizes="detail" />
          </div>

          <div className={styles.info}>
            {category && (
              <Link href={routes.category(category.handle)} className={styles.cat}>
                {category.name}
              </Link>
            )}
            <h1 className={styles.title}>{product.title}</h1>
            {product.subtitle && <p className={styles.subtitle}>{product.subtitle}</p>}

            <div className={styles.priceBlock}>
              <span className={styles.price} data-sale={onSale}>
                {formatEUR(amount)}
              </span>
              {onSale && original != null && (
                <>
                  <span className={styles.was}>{formatEUR(original)}</span>
                  <span className={styles.save}>
                    {t.offerSave} {formatEUR(original - amount)}
                  </span>
                </>
              )}
            </div>
            <p className={styles.unit}>
              {product.unit} · {t.ivaNote}
            </p>

            {hasOptions && (
              <div className={styles.options}>
                <p className={styles.optLabel}>{t.optionLabel}</p>
                <div className={styles.optBtns}>
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={styles.optBtn}
                      data-active={v.id === variantId}
                      onClick={() => setVariantId(v.id)}
                    >
                      {v.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.buy}>
              <div className={styles.stepper} aria-label={t.quantity}>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label={content.cart.decrease}
                >
                  <Icon name="minus" size={16} strokeWidth={2.2} />
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label={content.cart.increase}
                >
                  <Icon name="plus" size={16} strokeWidth={2.2} />
                </button>
              </div>
              <button
                type="button"
                className={styles.add}
                onClick={handleAdd}
                disabled={busy}
                data-added={added}
              >
                <Icon name={added ? "check" : "cart"} size={19} strokeWidth={2} />
                {added ? content.catalog.added : `${t.add} · ${formatEUR(amount * qty)}`}
              </button>
            </div>

            <ul className={styles.perks}>
              <li>
                <Icon name="truck" size={17} strokeWidth={1.7} />
                {t.freeShippingHint}
              </li>
              <li>
                <Icon name="check" size={17} strokeWidth={2} />
                {t.inStock}
              </li>
            </ul>

            <div className={styles.desc}>
              <h2 className={styles.descTitle}>{t.descriptionTitle}</h2>
              <p>{product.description}</p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>{t.related}</h2>
            <ul className={styles.relatedGrid}>
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} content={content} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
