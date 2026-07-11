/* ==========================================================================
   Plantilla Tienda — CONTRATO DE COMERCIO (forma Medusa)
   --------------------------------------------------------------------------
   Estos tipos calcan (un subconjunto de) la Store API de Medusa v2 a propósito:
   Product / ProductVariant / calculated_price / Cart / LineItem / Region /
   Order. La UI de la tienda SOLO conoce estos tipos y la interfaz
   `CommerceAdapter` — nunca los datos crudos del catálogo.

   ¿Por qué? Para que migrar a una tienda REAL con Medusa no sea rehacer la web,
   sino sustituir UNA pieza: el adaptador. Hoy corre `MockCommerceAdapter`
   (catálogo local en `catalog.ts`, carrito en localStorage). El día que un
   cliente quiera ecommerce de verdad, se escribe `MedusaCommerceAdapter`
   (envuelve `@medusajs/js-sdk`) y se devuelve desde `index.ts`. La UI no cambia.

   Los campos marcados como "extensión mock" NO existen en Medusa (emoji/tono
   para pintar el tile sin foto). Al migrar se ignoran: el `Product` real traerá
   `thumbnail`/`images` con URLs de fotos.
   ========================================================================== */

/** Precio calculado de una variante — forma Medusa v2 (importe en euros, decimal). */
export type MoneyAmount = {
  calculated_amount: number;
  currency_code: string;
  /** Precio "antes de" (compare-at). Si es mayor que calculated_amount → en oferta. */
  original_amount?: number;
};

/** Etiqueta de producto (forma Medusa: product.tags[].value). */
export type ProductTag = { value: string };

export type ProductOptionValue = { id: string; value: string };
export type ProductOption = {
  id: string;
  title: string;
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  title: string;
  sku?: string;
  calculated_price: MoneyAmount;
  /** Stock disponible. En el mock lo servimos local; en Medusa viene del módulo de inventario. */
  inventory_quantity?: number;
  /** Mapa título-de-opción → valor (ej. { "Formato": "1 L" }). */
  options?: Record<string, string>;
};

export type ProductCategory = {
  id: string;
  name: string;
  handle: string;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  subtitle?: string | null;
  description: string;
  /** URL de la foto de producto (asset de Sanity en el mock; foto real en Medusa). */
  thumbnail?: string | null;
  images?: { url: string }[];
  options: ProductOption[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  /** Etiquetas (destacado, recomendado, oferta-semana, oferta-mes…). Forma Medusa. */
  tags: ProductTag[];
  /** Unidad de venta mostrada bajo el precio (ej. "1 kg", "ud."). Extensión del mock. */
  unit?: string | null;
};

export type LineItem = {
  id: string;
  product_id: string;
  variant_id: string;
  product_title: string;
  variant_title: string;
  handle: string;
  thumbnail?: string | null;
  unit_price: number;
  original_unit_price?: number | null;
  quantity: number;
  /** subtotal de la línea = unit_price * quantity */
  total: number;
};

export type Cart = {
  id: string;
  region_id: string;
  currency_code: string;
  items: LineItem[];
  /** Suma de las líneas (IVA incluido, como es habitual en retail en España). */
  item_subtotal: number;
  shipping_total: number;
  total: number;
};

export type Region = {
  id: string;
  name: string;
  currency_code: string;
};

export type Order = {
  id: string;
  display_id: number;
  email: string;
  total: number;
  item_count: number;
};

export type CheckoutDetails = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  email: string;
  phone?: string;
  /** Franja horaria de reparto elegida. */
  shipping_slot?: string;
  /** "cod" (pago al recibir) | "card" (tarjeta — en Medusa real iría por el módulo de pagos). */
  payment_method?: string;
  notes?: string;
};

export type ProductSort =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "name"
  | "offers";

export type ProductListQuery = {
  category_handle?: string | null;
  /** Filtra por etiqueta (destacado, recomendado, oferta-semana, oferta-mes). */
  tag?: string | null;
  /** Solo productos en oferta. */
  on_sale?: boolean;
  /** Búsqueda de texto (título / descripción / categoría). */
  q?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  sort?: ProductSort;
  limit?: number | null;
};

export type ProductListResult = {
  products: Product[];
  count: number;
};

/**
 * Contrato único de comercio. Lo implementa el mock hoy y lo implementará el
 * adaptador de Medusa mañana. Cada método mapea 1:1 con la Store API de Medusa:
 *
 *   listProducts   → sdk.store.product.list
 *   getProduct     → sdk.store.product.retrieve (by handle)
 *   listCategories → sdk.store.category.list
 *   getRegion      → sdk.store.region.list
 *   createCart     → sdk.store.cart.create
 *   retrieveCart   → sdk.store.cart.retrieve
 *   addLineItem    → sdk.store.cart.createLineItem
 *   updateLineItem → sdk.store.cart.updateLineItem
 *   removeLineItem → sdk.store.cart.deleteLineItem
 *   completeCart   → sdk.store.cart.complete  (paso de pago incluido)
 */
export interface CommerceAdapter {
  listProducts(query?: ProductListQuery): Promise<ProductListResult>;
  getProduct(handle: string): Promise<Product | null>;
  listCategories(): Promise<ProductCategory[]>;
  getRegion(): Promise<Region>;
  retrieveCart(cartId: string): Promise<Cart | null>;
  createCart(): Promise<Cart>;
  addLineItem(
    cartId: string,
    variantId: string,
    quantity: number
  ): Promise<Cart>;
  updateLineItem(
    cartId: string,
    lineId: string,
    quantity: number
  ): Promise<Cart>;
  removeLineItem(cartId: string, lineId: string): Promise<Cart>;
  completeCart(cartId: string, details: CheckoutDetails): Promise<Order>;
}
