/* ==========================================================================
   Plantilla Tienda — MockCommerceAdapter
   --------------------------------------------------------------------------
   Implementación del `CommerceAdapter` sobre el catálogo local + un carrito en
   localStorage. Es la "costura": lo único que se tira al migrar a Medusa. Toda
   la UI habla con esta interfaz, así que sustituir esta clase por
   `MedusaCommerceAdapter` (mismo contrato) no toca ni un componente.
   ========================================================================== */

import type {
  Cart,
  CheckoutDetails,
  CommerceAdapter,
  LineItem,
  Order,
  Product,
  ProductCategory,
  ProductListQuery,
  ProductListResult,
  Region,
} from "./types";
import {
  CATEGORIES,
  FREE_SHIPPING_THRESHOLD,
  PRODUCTS,
  REGION,
  SHIPPING_FLAT,
} from "./catalog";
import { cheapestAmount, productOnSale } from "./product-utils";

type StoredItem = { variant_id: string; quantity: number };
type StoredCart = { id: string; items: StoredItem[] };

const STORAGE_KEY = "lacesta_cart_v1";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const VARIANT_INDEX = new Map<
  string,
  { product: Product; variant: Product["variants"][number] }
>();
for (const product of PRODUCTS) {
  for (const variant of product.variants) {
    VARIANT_INDEX.set(variant.id, { product, variant });
  }
}

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 14)}`;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export class MockCommerceAdapter implements CommerceAdapter {
  // ----- Catálogo (equivalente a las lecturas de la Store API) -----

  async listProducts(query: ProductListQuery = {}): Promise<ProductListResult> {
    let products = PRODUCTS.slice();

    if (query.category_handle) {
      products = products.filter((p) =>
        p.categories.some((c) => c.handle === query.category_handle)
      );
    }
    if (query.tag) {
      products = products.filter((p) =>
        p.tags.some((t) => t.value === query.tag)
      );
    }
    if (query.on_sale) {
      products = products.filter(productOnSale);
    }
    if (query.q) {
      const q = norm(query.q);
      products = products.filter((p) => {
        const hay = norm(
          `${p.title} ${p.subtitle ?? ""} ${p.description} ${p.categories
            .map((c) => c.name)
            .join(" ")}`
        );
        return hay.includes(q);
      });
    }
    if (query.min_price != null) {
      products = products.filter((p) => cheapestAmount(p) >= query.min_price!);
    }
    if (query.max_price != null) {
      products = products.filter((p) => cheapestAmount(p) <= query.max_price!);
    }

    switch (query.sort) {
      case "price_asc":
        products.sort((a, b) => cheapestAmount(a) - cheapestAmount(b));
        break;
      case "price_desc":
        products.sort((a, b) => cheapestAmount(b) - cheapestAmount(a));
        break;
      case "name":
        products.sort((a, b) => a.title.localeCompare(b.title, "es"));
        break;
      case "offers":
        products.sort(
          (a, b) => Number(productOnSale(b)) - Number(productOnSale(a))
        );
        break;
      default:
        break;
    }

    const count = products.length;
    if (query.limit != null) products = products.slice(0, query.limit);
    return { products, count };
  }

  async getProduct(handle: string): Promise<Product | null> {
    return PRODUCTS.find((p) => p.handle === handle) ?? null;
  }

  async listCategories(): Promise<ProductCategory[]> {
    return CATEGORIES;
  }

  async getRegion(): Promise<Region> {
    return { ...REGION };
  }

  // ----- Carrito (localStorage; en Medusa serían llamadas al server) -----

  private read(): StoredCart | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredCart) : null;
    } catch {
      return null;
    }
  }

  private write(cart: StoredCart): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* almacenamiento lleno / bloqueado */
    }
  }

  private clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }

  /** Reconstruye un `Cart` con forma Medusa desde los items almacenados. */
  private hydrate(stored: StoredCart): Cart {
    const items: LineItem[] = [];
    for (const si of stored.items) {
      const found = VARIANT_INDEX.get(si.variant_id);
      if (!found) continue;
      const { product, variant } = found;
      const unit = variant.calculated_price.calculated_amount;
      const original = variant.calculated_price.original_amount ?? null;
      const quantity = Math.max(1, si.quantity);
      items.push({
        id: `item_${variant.id}`,
        product_id: product.id,
        variant_id: variant.id,
        product_title: product.title,
        variant_title: variant.title,
        handle: product.handle,
        thumbnail: product.thumbnail ?? null,
        unit_price: unit,
        original_unit_price: original,
        quantity,
        total: round2(unit * quantity),
      });
    }

    const item_subtotal = round2(items.reduce((s, i) => s + i.total, 0));
    const shipping_total =
      items.length === 0 || item_subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_FLAT;
    const total = round2(item_subtotal + shipping_total);

    return {
      id: stored.id,
      region_id: REGION.id,
      currency_code: REGION.currency_code,
      items,
      item_subtotal,
      shipping_total,
      total,
    };
  }

  async retrieveCart(cartId: string): Promise<Cart | null> {
    const stored = this.read();
    if (!stored || stored.id !== cartId) return null;
    return this.hydrate(stored);
  }

  async createCart(): Promise<Cart> {
    const stored: StoredCart = { id: newId("cart"), items: [] };
    this.write(stored);
    return this.hydrate(stored);
  }

  private mutate(
    cartId: string,
    fn: (items: StoredItem[]) => StoredItem[]
  ): Cart {
    const current = this.read();
    const base: StoredCart =
      current && current.id === cartId ? current : { id: cartId, items: [] };
    const next: StoredCart = { id: base.id, items: fn([...base.items]) };
    this.write(next);
    return this.hydrate(next);
  }

  async addLineItem(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<Cart> {
    if (!VARIANT_INDEX.has(variantId)) {
      throw new Error(`Variante desconocida: ${variantId}`);
    }
    const qty = Math.max(1, Math.floor(quantity));
    return this.mutate(cartId, (items) => {
      const existing = items.find((i) => i.variant_id === variantId);
      if (existing) existing.quantity += qty;
      else items.push({ variant_id: variantId, quantity: qty });
      return items;
    });
  }

  async updateLineItem(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<Cart> {
    const qty = Math.floor(quantity);
    return this.mutate(cartId, (items) => {
      const target = items.find((i) => `item_${i.variant_id}` === lineId);
      if (!target) return items;
      if (qty <= 0) return items.filter((i) => i !== target);
      target.quantity = qty;
      return items;
    });
  }

  async removeLineItem(cartId: string, lineId: string): Promise<Cart> {
    return this.mutate(cartId, (items) =>
      items.filter((i) => `item_${i.variant_id}` !== lineId)
    );
  }

  async completeCart(
    cartId: string,
    details: CheckoutDetails
  ): Promise<Order> {
    const stored = this.read();
    const cart =
      stored && stored.id === cartId
        ? this.hydrate(stored)
        : await this.createCart();
    const item_count = cart.items.reduce((s, i) => s + i.quantity, 0);
    // En Medusa real: crear sesión de pago (Stripe vía módulo de pagos) y
    // completar el pedido. En la demo confirmamos sin cobrar.
    this.clear();
    return {
      id: newId("order"),
      display_id: 1000 + Math.floor(Math.random() * 9000),
      email: details.email,
      total: cart.total,
      item_count,
    };
  }
}
