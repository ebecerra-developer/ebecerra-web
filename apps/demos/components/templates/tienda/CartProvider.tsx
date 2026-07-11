"use client";

/* ==========================================================================
   Plantilla Tienda — CartProvider
   --------------------------------------------------------------------------
   Estado de carrito + apertura del drawer, encima del `CommerceAdapter`. NO
   sabe si detrás hay un mock o Medusa: llama a getCommerce() y guarda el `Cart`
   que le devuelven. Ese es justo el punto que hace trivial el cambio a Medusa.
   ========================================================================== */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCommerce, type Cart, type CheckoutDetails, type Order } from "./commerce";

const CART_ID_KEY = "tienda_rosales_cart_id_v1";

type CartContextValue = {
  cart: Cart | null;
  itemCount: number;
  busy: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  setQty: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  completeOrder: (details: CheckoutDetails) => Promise<Order | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const cartIdRef = useRef<string | null>(null);

  // Al montar: recupera el carrito guardado o crea uno nuevo.
  useEffect(() => {
    let alive = true;
    const commerce = getCommerce();
    const savedId =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CART_ID_KEY)
        : null;

    (async () => {
      let next: Cart | null = null;
      if (savedId) next = await commerce.retrieveCart(savedId);
      if (!next) {
        next = await commerce.createCart();
        try {
          window.localStorage.setItem(CART_ID_KEY, next.id);
        } catch {
          /* noop */
        }
      }
      if (!alive) return;
      cartIdRef.current = next.id;
      setCart(next);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartIdRef.current) return cartIdRef.current;
    const commerce = getCommerce();
    const created = await commerce.createCart();
    cartIdRef.current = created.id;
    setCart(created);
    try {
      window.localStorage.setItem(CART_ID_KEY, created.id);
    } catch {
      /* noop */
    }
    return created.id;
  }, []);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setBusy(true);
      try {
        const id = await ensureCart();
        const next = await getCommerce().addLineItem(id, variantId, quantity);
        setCart(next);
        setIsOpen(true);
      } finally {
        setBusy(false);
      }
    },
    [ensureCart]
  );

  const setQty = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cartIdRef.current) return;
      setBusy(true);
      try {
        const next = await getCommerce().updateLineItem(
          cartIdRef.current,
          lineId,
          quantity
        );
        setCart(next);
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (lineId: string) => {
    if (!cartIdRef.current) return;
    setBusy(true);
    try {
      const next = await getCommerce().removeLineItem(cartIdRef.current, lineId);
      setCart(next);
    } finally {
      setBusy(false);
    }
  }, []);

  const completeOrder = useCallback(
    async (details: CheckoutDetails): Promise<Order | null> => {
      if (!cartIdRef.current) return null;
      setBusy(true);
      try {
        const order = await getCommerce().completeCart(
          cartIdRef.current,
          details
        );
        // Pedido cerrado → arranca un carrito nuevo y vacío.
        const fresh = await getCommerce().createCart();
        cartIdRef.current = fresh.id;
        try {
          window.localStorage.setItem(CART_ID_KEY, fresh.id);
        } catch {
          /* noop */
        }
        setCart(fresh);
        setIsOpen(false);
        return order;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  const itemCount = useMemo(
    () => (cart?.items ?? []).reduce((s, i) => s + i.quantity, 0),
    [cart]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount,
      busy,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQty,
      removeItem,
      completeOrder,
    }),
    [cart, itemCount, busy, isOpen, addItem, setQty, removeItem, completeOrder]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
