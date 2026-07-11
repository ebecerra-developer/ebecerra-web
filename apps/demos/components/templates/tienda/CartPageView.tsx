"use client";

import Link from "next/link";
import { formatEUR, FREE_SHIPPING_THRESHOLD } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import Icon from "./Icon";
import styles from "./CartPageView.module.css";

export default function CartPageView({ content }: { content: TiendaContent }) {
  const { cart, setQty, removeItem, busy } = useCart();
  const t = content.cart;
  const items = cart?.items ?? [];
  const subtotal = cart?.item_subtotal ?? 0;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeReached = items.length > 0 && remaining <= 0;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.title}>{t.pageTitle}</h1>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="cart" size={52} strokeWidth={1.2} />
            <p className={styles.emptyTitle}>{t.empty}</p>
            <p className={styles.emptyHint}>{t.emptyHint}</p>
            <Link href={routes.category("todos")} className={styles.emptyCta}>
              {t.emptyCta}
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.list}>
              {items.map((it) => (
                <article key={it.id} className={styles.item}>
                  <Link href={routes.product(it.handle)} className={styles.thumb}>
                    {it.thumbnail ? (
                      <img src={it.thumbnail} alt="" className={styles.thumbImg} />
                    ) : (
                      <Icon name="cart" size={26} strokeWidth={1.3} />
                    )}
                  </Link>
                  <div className={styles.itemMain}>
                    <div className={styles.itemHead}>
                      <div>
                        <h2 className={styles.itemTitle}>
                          <Link href={routes.product(it.handle)}>{it.product_title}</Link>
                        </h2>
                        <p className={styles.itemVariant}>{it.variant_title}</p>
                        <p className={styles.itemUnit}>{formatEUR(it.unit_price)} / ud.</p>
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => removeItem(it.id)}
                        aria-label={`${t.remove}: ${it.product_title}`}
                        disabled={busy}
                      >
                        <Icon name="trash" size={18} strokeWidth={1.6} />
                      </button>
                    </div>
                    <div className={styles.itemFoot}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          onClick={() => setQty(it.id, it.quantity - 1)}
                          aria-label={t.decrease}
                          disabled={busy}
                        >
                          <Icon name="minus" size={16} strokeWidth={2.2} />
                        </button>
                        <span>{it.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQty(it.id, it.quantity + 1)}
                          aria-label={t.increase}
                          disabled={busy}
                        >
                          <Icon name="plus" size={16} strokeWidth={2.2} />
                        </button>
                      </div>
                      <span className={styles.itemTotal}>{formatEUR(it.total)}</span>
                    </div>
                  </div>
                </article>
              ))}
              <Link href={routes.category("todos")} className={styles.continue}>
                <Icon name="chevronLeft" size={16} strokeWidth={2} />
                {t.continue}
              </Link>
            </div>

            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>{t.total}</h2>
              <div className={styles.summaryRows}>
                <div className={styles.row}>
                  <span>{t.subtotal}</span>
                  <span>{formatEUR(subtotal)}</span>
                </div>
                <div className={styles.row}>
                  <span>{t.shipping}</span>
                  <span>
                    {cart && cart.shipping_total === 0
                      ? t.shippingFree
                      : formatEUR(cart?.shipping_total ?? 0)}
                  </span>
                </div>
                <div className={`${styles.row} ${styles.totalRow}`}>
                  <span>{t.total}</span>
                  <span>{formatEUR(cart?.total ?? 0)}</span>
                </div>
              </div>
              {!freeReached && (
                <p className={styles.shipHint}>
                  <Icon name="truck" size={16} strokeWidth={1.7} />
                  {t.freeShippingHint.replace("{amount}", formatEUR(remaining))}
                </p>
              )}
              <p className={styles.iva}>{t.ivaNote}</p>
              <Link href={routes.checkout()} className={styles.checkout}>
                {t.checkout}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
