"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { formatEUR } from "./commerce";
import type { Order } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import { useCart } from "./CartProvider";
import Icon from "./Icon";
import styles from "./CheckoutView.module.css";

type Form = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  email: string;
  phone: string;
  shipping_slot: string;
  notes: string;
};

export default function CheckoutView({ content }: { content: TiendaContent }) {
  const { cart, completeOrder, busy } = useCart();
  const { checkout, cart: cartT } = content;
  const [form, setForm] = useState<Form>({
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    postal_code: "",
    email: "",
    phone: "",
    shipping_slot: checkout.slots[0],
    notes: "",
  });
  const [payment, setPayment] = useState<"cod" | "card">("cod");
  const [error, setError] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const set = (key: keyof Form) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isValid = useMemo(
    () =>
      form.first_name.trim() &&
      form.last_name.trim() &&
      form.address.trim() &&
      form.city.trim() &&
      form.postal_code.trim() &&
      /.+@.+\..+/.test(form.email) &&
      form.shipping_slot,
    [form]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError(true);
      return;
    }
    setError(false);
    const placed = await completeOrder({ ...form, payment_method: payment });
    if (placed) setOrder(placed);
  };

  const items = cart?.items ?? [];

  if (order) {
    return (
      <div className={styles.stateWrap}>
        <div className={styles.state}>
          <span className={styles.stateIcon} data-ok="true">
            <Icon name="check" size={40} strokeWidth={2.4} />
          </span>
          <h1 className={styles.stateTitle}>{checkout.successTitle}</h1>
          <p className={styles.stateBody}>
            {checkout.successBody.replace("{order}", String(order.display_id))}
          </p>
          <Link href={routes.home()} className={styles.stateCta}>
            {checkout.successCta}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.stateWrap}>
        <div className={styles.state}>
          <Icon name="cart" size={46} strokeWidth={1.3} />
          <p className={styles.stateBody}>{checkout.emptyRedirect}</p>
          <Link href={routes.category("todos")} className={styles.stateCta}>
            {cartT.emptyCta}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <Link href={routes.cart()} className={styles.back}>
          <Icon name="chevronLeft" size={16} strokeWidth={2} />
          {checkout.back}
        </Link>
        <h1 className={styles.title}>{checkout.title}</h1>

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h2 className={styles.sectionTitle}>{checkout.dataTitle}</h2>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>{checkout.fields.firstName} *</span>
                <input value={form.first_name} onChange={set("first_name")} autoComplete="given-name" required />
              </label>
              <label className={styles.field}>
                <span>{checkout.fields.lastName} *</span>
                <input value={form.last_name} onChange={set("last_name")} autoComplete="family-name" required />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>{checkout.fields.address} *</span>
                <input value={form.address} onChange={set("address")} autoComplete="street-address" required />
              </label>
              <label className={styles.field}>
                <span>{checkout.fields.city} *</span>
                <input value={form.city} onChange={set("city")} autoComplete="address-level2" required />
              </label>
              <label className={styles.field}>
                <span>{checkout.fields.postalCode} *</span>
                <input value={form.postal_code} onChange={set("postal_code")} autoComplete="postal-code" inputMode="numeric" required />
              </label>
              <label className={styles.field}>
                <span>{checkout.fields.email} *</span>
                <input type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
              </label>
              <label className={styles.field}>
                <span>{checkout.fields.phone}</span>
                <input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>{checkout.fields.slot} *</span>
                <select value={form.shipping_slot} onChange={set("shipping_slot")}>
                  {checkout.slots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>{checkout.fields.notes}</span>
                <textarea value={form.notes} onChange={set("notes")} rows={2} />
              </label>
            </div>

            <h2 className={styles.sectionTitle}>{checkout.payTitle}</h2>
            <div className={styles.payments}>
              <label className={styles.payOption} data-active={payment === "cod"}>
                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                <span>{checkout.payCod}</span>
              </label>
              <label className={styles.payOption} data-active={payment === "card"}>
                <input type="radio" name="payment" checked={payment === "card"} onChange={() => setPayment("card")} />
                <span>{checkout.payCard}</span>
              </label>
              {payment === "card" && <p className={styles.payNote}>{checkout.payCardNote}</p>}
            </div>

            {error && <p className={styles.error}>{checkout.requiredError}</p>}

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy ? checkout.submitting : checkout.submit}
            </button>
            <p className={styles.demoNote}>{checkout.demoNote}</p>
          </form>

          <aside className={styles.summary}>
            <h2 className={styles.sectionTitle}>{checkout.summary}</h2>
            <ul className={styles.summaryItems}>
              {items.map((it) => (
                <li key={it.id} className={styles.sItem}>
                  <span className={styles.sThumb}>
                    {it.thumbnail ? (
                      <img src={it.thumbnail} alt="" className={styles.sThumbImg} />
                    ) : (
                      <Icon name="cart" size={20} strokeWidth={1.4} />
                    )}
                    <span className={styles.sQty}>{it.quantity}</span>
                  </span>
                  <span className={styles.sInfo}>
                    <span className={styles.sTitle}>{it.product_title}</span>
                    <span className={styles.sMeta}>{it.variant_title}</span>
                  </span>
                  <span className={styles.sTotal}>{formatEUR(it.total)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.summaryRows}>
              <div className={styles.row}>
                <span>{cartT.subtotal}</span>
                <span>{formatEUR(cart?.item_subtotal ?? 0)}</span>
              </div>
              <div className={styles.row}>
                <span>{cartT.shipping}</span>
                <span>
                  {cart && cart.shipping_total === 0
                    ? cartT.shippingFree
                    : formatEUR(cart?.shipping_total ?? 0)}
                </span>
              </div>
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span>{cartT.total}</span>
                <span>{formatEUR(cart?.total ?? 0)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
