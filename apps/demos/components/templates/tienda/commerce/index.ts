/* ==========================================================================
   Plantilla Tienda — PUNTO ÚNICO DE CONMUTACIÓN mock ↔ Medusa
   --------------------------------------------------------------------------
   `getCommerce()` es el único sitio que decide qué adaptador se usa. Toda la UI
   importa el contrato desde aquí y llama a `getCommerce()`.

   Migrar a una tienda real:
     1. `npm i @medusajs/js-sdk` y crear `medusaAdapter.ts` con
        `class MedusaCommerceAdapter implements CommerceAdapter` (envuelve el SDK).
     2. Sustituir la línea de abajo por algo como:
          adapter = process.env.NEXT_PUBLIC_MEDUSA_URL
            ? new MedusaCommerceAdapter(process.env.NEXT_PUBLIC_MEDUSA_URL)
            : new MockCommerceAdapter();
   Ni un componente cambia: todos hablan con `CommerceAdapter`.
   ========================================================================== */

import { MockCommerceAdapter } from "./mockAdapter";
import type { CommerceAdapter } from "./types";

let adapter: CommerceAdapter | null = null;

export function getCommerce(): CommerceAdapter {
  if (!adapter) adapter = new MockCommerceAdapter();
  return adapter;
}

export * from "./types";
export * from "./product-utils";
export { formatEUR } from "./money";
export {
  PRODUCTS,
  CATEGORIES,
  CATEGORY_ICON,
  TAG,
  REGION,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
} from "./catalog";
