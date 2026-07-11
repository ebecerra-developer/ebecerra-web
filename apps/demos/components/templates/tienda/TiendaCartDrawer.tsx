"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatEUR, FREE_SHIPPING_THRESHOLD } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import styles from "./TiendaCartDrawer.module.css";

export default function TiendaCartDrawer({ content }: { content: TiendaContent }) {
  const { cart, isOpen, closeCart, setQty, removeItem, busy } = useCart();
  const { cart: t } = content;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  const items = cart?.items ?? [];
  const subtotal = cart?.item_subtotal ?? 0;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeReached = items.length > 0 && remaining <= 0;

  const drawer = (
    <div data-template="tienda" className={styles.root} data-open={isOpen}>
      <div className={styles.backdrop} onClick={closeCart} aria-hidden="true" />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            {t.title}
            {items.length > 0 && (
              <span className={styles.count}>
                {items.length} {t.itemsLabel}
              </span>
            )}
          </h2>
          <button type="button" className={styles.close} onClick={closeCart} aria-label={t.close}>
            <Icon name="close" size={20} />
          </button>
        </header>

        {items.length > 0 && (
          <div className={styles.shipBar} data-full={freeReached}>
            <Icon name="truck" size={18} strokeWidth={1.7} />
            <p className={styles.shipMsg}>
              {freeReached
                ? t.freeShippingReached
                : t.freeShippingHint.replace("{amount}", formatEUR(remaining))}
            </p>
          </div>
        )}

        {items.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="cart" size={44} strokeWidth={1.3} className={styles.emptyIcon} />
            <p>{t.empty}</p>
            <button type="button" className={styles.emptyCta} onClick={closeCart}>
              {t.emptyCta}
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {items.map((it) => (
                <li key={it.id} className={styles.item}>
                  <Link
                    href={routes.product(it.handle)}
                    className={styles.thumb}
                    onClick={closeCart}
                  >
                    {it.thumbnail ? (
                      <img src={it.thumbnail} alt="" className={styles.thumbImg} />
                    ) : (
                      <Icon name="cart" size={22} strokeWidth={1.4} />
                    )}
                  </Link>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemTitle}>{it.product_title}</p>
                    <p className={styles.itemVariant}>{it.variant_title}</p>
                    <div className={styles.itemBottom}>
                      <div className={styles.stepper}>
                        <button
                          type="button"
                          onClick={() => setQty(it.id, it.quantity - 1)}
                          aria-label={t.decrease}
                          disabled={busy}
                        >
                          <Icon name="minus" size={15} strokeWidth={2.2} />
                        </button>
                        <span>{it.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQty(it.id, it.quantity + 1)}
                          aria-label={t.increase}
                          disabled={busy}
                        >
                          <Icon name="plus" size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                      <span className={styles.itemTotal}>{formatEUR(it.total)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeItem(it.id)}
                    aria-label={`${t.remove}: ${it.product_title}`}
                    disabled={busy}
                  >
                    <Icon name="trash" size={17} strokeWidth={1.6} />
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.summary}>
              <div className={styles.row}>
                <span>{t.subtotal}</span>
                <span className={styles.subtotalVal}>{formatEUR(subtotal)}</span>
              </div>
              <p className={styles.iva}>{t.ivaNote} · reparto calculado al finalizar</p>
              <Link href={routes.checkout()} className={styles.checkout} onClick={closeCart}>
                {t.checkout}
              </Link>
              <Link href={routes.cart()} className={styles.viewCart} onClick={closeCart}>
                {t.viewCart}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );

  if (!mounted) return null;
  return createPortal(drawer, document.body);
}
