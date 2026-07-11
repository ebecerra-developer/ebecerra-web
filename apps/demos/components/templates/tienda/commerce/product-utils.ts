/* Helpers de precio y etiquetas sobre `Product` (forma Medusa). */

import type { Product, ProductVariant } from "./types";

export function cheapestVariant(product: Product): ProductVariant {
  return product.variants.reduce((min, v) =>
    v.calculated_price.calculated_amount < min.calculated_price.calculated_amount
      ? v
      : min
  );
}

export function cheapestAmount(product: Product): number {
  return cheapestVariant(product).calculated_price.calculated_amount;
}

export function productOnSale(product: Product): boolean {
  return product.variants.some(
    (v) =>
      v.calculated_price.original_amount != null &&
      v.calculated_price.original_amount > v.calculated_price.calculated_amount
  );
}

export function hasTag(product: Product, tag: string): boolean {
  return product.tags.some((t) => t.value === tag);
}

export type PriceInfo = {
  /** Importe a mostrar (el de la variante más barata). */
  amount: number;
  /** Precio "antes" si está en oferta, si no null. */
  original: number | null;
  onSale: boolean;
  /** % de descuento redondeado (solo si onSale). */
  discountPct: number | null;
  /** true si hay varias variantes con precios distintos ("desde X€"). */
  fromMultiple: boolean;
};

export function getPriceInfo(product: Product): PriceInfo {
  const variant = cheapestVariant(product);
  const amount = variant.calculated_price.calculated_amount;
  const original = variant.calculated_price.original_amount ?? null;
  const onSale = original != null && original > amount;
  const amounts = product.variants.map(
    (v) => v.calculated_price.calculated_amount
  );
  const fromMultiple = new Set(amounts).size > 1;
  return {
    amount,
    original: onSale ? original : null,
    onSale,
    discountPct: onSale ? Math.round((1 - amount / original!) * 100) : null,
    fromMultiple,
  };
}
