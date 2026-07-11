/* Rutas de la tienda (multipágina). Base = slug del demoSite. Si cambia el
   slug, se cambia solo aquí. Locale por defecto (es) sin prefijo. */

export const BASE = "/la-cesta";

export const routes = {
  home: () => BASE,
  category: (handle: string) => `${BASE}/categoria/${handle}`,
  product: (handle: string) => `${BASE}/producto/${handle}`,
  offers: () => `${BASE}/categoria/ofertas`,
  search: (q?: string) =>
    q ? `${BASE}/buscar?q=${encodeURIComponent(q)}` : `${BASE}/buscar`,
  cart: () => `${BASE}/carrito`,
  checkout: () => `${BASE}/checkout`,
};
