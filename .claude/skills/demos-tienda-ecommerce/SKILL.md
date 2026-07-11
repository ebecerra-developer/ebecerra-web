---
name: demos-tienda-ecommerce
description: Plantilla `tienda` de apps/demos — supermercado online MULTIPÁGINA ("La Cesta") con un contrato de comercio con forma de Medusa. Úsalo al tocar la demo La Cesta, al añadir productos/categorías/ofertas, al crear otra tienda ecommerce, o cuando haya que migrar el mock a Medusa real. Cubre el contrato/adaptador, la arquitectura multipágina, el pipeline de imágenes IA de Sanity y los GOTCHAS caros (wrapper data-template, foco del buscador, thumbnail de galería).
---

# Tienda ecommerce — plantilla `tienda` (La Cesta)

Supermercado online **multipágina real** (NO una SPA) sobre `apps/demos`: home con secciones de súper (ofertas semana/mes, destacados, recomendados), páginas de categoría con filtros, ficha de producto, buscador, carrito y checkout — cada uno con su URL. Es una plantilla de `apps/demos` → lee también `/demos-template-system`, pero rompe el patrón de plantillas apiladas (como hizo `expedicion`), por eso tiene skill propio.

Marca demo: **La Cesta** (slug `la-cesta`), ES-only, noindex, publicada en `/ejemplos`.

## Filosofía comercial

El objetivo NO es solo la demo: es tener una base de ecommerce **reutilizable para clientes**. El motor elegido para producción real es **Medusa v2** (Node/TS, MIT, self-host). Por eso todo el código habla con un **contrato con forma de Medusa**: el día que un cliente quiera tienda de verdad, se sustituye UNA pieza (el adaptador) y la UI no cambia. Ver [[project_tienda_ecommerce_demo]].

## Dónde vive

```
apps/demos/components/templates/tienda/
├── commerce/                    ← EL NÚCLEO REUTILIZABLE (forma Medusa)
│   ├── types.ts                 ← Product/Variant/calculated_price/Cart/LineItem/Order + interface CommerceAdapter
│   ├── mockAdapter.ts           ← MockCommerceAdapter (catálogo local + cesta localStorage) — la "costura"
│   ├── catalog.ts               ← catálogo semilla (25 productos, categorías, TAGs, ofertas)
│   ├── product-utils.ts         ← getPriceInfo/cheapestAmount/productOnSale/hasTag
│   ├── images.ts                ← mapa handle→URL de asset Sanity (fotos IA)
│   ├── money.ts                 ← formatEUR
│   └── index.ts                 ← getCommerce() = PUNTO ÚNICO de conmutación mock↔Medusa + re-exports
├── content.ts                   ← copy de chrome (nav, home, footer, labels). NO el catálogo. ES-only, `as const`
├── routes.ts                    ← BASE="/la-cesta" + helpers de URL (home/category/product/search/cart/checkout)
├── Icon.tsx                     ← set de iconos SVG de línea (SIN emojis)
├── ProductImage.tsx             ← foto real o placeholder con icono de categoría
├── TiendaChrome.tsx             ← wrapper cliente: CartProvider + Nav + Drawer + Footer (ver GOTCHA data-template)
├── CartProvider.tsx             ← estado de cesta sobre el CommerceAdapter
├── Tienda{Nav,Footer,CartDrawer}, ProductCard, ProductRow, CategoryTiles, PromoHero, TiendaTemplate(home)
├── CategoryView / ProductDetail / SearchView / CartPageView / CheckoutView  ← vistas de cada página
packages/tokens/demos-tienda.css ← tokens scopeados a [data-template="tienda"]
apps/demos/app/[locale]/[slug]/{categoria/[handle],producto/[handle],buscar,carrito,checkout}/page.tsx
```

## El contrato forma-Medusa (lo importante)

Toda la UI conoce SOLO la interfaz `CommerceAdapter` (en `commerce/types.ts`) y llama a `getCommerce()`. Cada método mapea 1:1 con la Store API de Medusa v2:

| CommerceAdapter | Medusa v2 |
|---|---|
| listProducts / getProduct | sdk.store.product.list / retrieve |
| listCategories / getRegion | sdk.store.category.list / region |
| createCart / retrieveCart | sdk.store.cart.create / retrieve |
| add/update/removeLineItem | sdk.store.cart.create/update/deleteLineItem |
| completeCart | sdk.store.cart.complete (incluye pago) |

**Migrar a Medusa real:** `npm i @medusajs/js-sdk`, crear `commerce/medusaAdapter.ts` con `class MedusaCommerceAdapter implements CommerceAdapter`, y en `commerce/index.ts` devolverlo desde `getCommerce()` (gateado por env, p.ej. `NEXT_PUBLIC_MEDUSA_URL`). Ni un componente cambia. El checkout es visual: el pago va abstraído en `completeCart` (en Medusa real iría por su módulo de pagos + Stripe — por eso NO se implementó Stripe a mano).

**Modelo de datos:** ofertas = `variant.calculated_price.original_amount > calculated_amount` (precio tachado). Destacado/recomendado/oferta-semana/oferta-mes = `product.tags[].value` (constantes en `catalog.ts` `TAG`). Añadir producto = una entrada en `SEED` de `catalog.ts` (+ imagen en `images.ts`).

## Arquitectura multipágina

- Cada página server bajo `app/[locale]/[slug]/…/page.tsx` está **guardada al slug** con `const TIENDA_SLUG = "la-cesta"; if (slug !== TIENDA_SLUG) notFound();` (como las subpáginas de gestoría). noindex + `generateStaticParams` con las locales × slug (× handles en categoria/producto).
- Cada página envuelve su contenido en `<><DemoBanner template="tienda" /><TiendaChrome categories={…}>{vista}</TiendaChrome></>`.
- `TiendaChrome` (cliente) = `CartProvider` + Nav + `<main>` + Footer + CartDrawer. La **cesta persiste entre navegaciones** vía localStorage (el adaptador la rehidrata en cada carga). Los server components (home, listados) pasan datos ya fetcheados; los `ProductCard` (cliente) reciben el contexto de cesta aunque se rendericen desde un server component (patrón children).
- El catálogo es local y síncrono → las páginas lo leen vía `getCommerce()` sin fetch remoto.

## GOTCHAS caros (léelos antes de tocar)

1. **`data-template="tienda"` DEBE envolver todo el chrome.** `TiendaChrome` renderiza `<div data-template="tienda">` alrededor de nav/main/footer. Si falta, TODA la tienda hereda los tokens `:root` de fisio (fondo crema, botones petróleo, textos lavados sin contraste). Pasó al migrar de SPA a multipágina: el wrapper vivía en el `TiendaTemplate` viejo y se perdió. Regla: en plantillas multipágina el wrapper `data-template` va en el **chrome compartido**, no solo en la page raíz.
2. **Foco del buscador:** el `<input>` hereda el anillo de foco global (`:focus-visible { box-shadow: --sh-focus }`) → pinta un rectángulo dentro de la píldora redondeada. Fix: `.searchInput:focus, :focus-visible { box-shadow: none }` y la afordancia va en `.search:focus-within` (borde + ring suave).
3. **Contraste WCAG.** La paleta se cambió de verde a **marrón/tierra** (CTA `#795130`, acento rust `#bf4a2a`, footer espresso). Verificar CUALQUIER par texto/fondo ≥4.5:1 con un script de contraste (ver `scripts/contrast-check.mjs` si existe, o el snippet en `/design-tokens`). Un color de marca demasiado claro (el verde `#17924e` daba 3.99) falla como texto sobre blanco Y como fondo de botón con texto blanco.
4. **Sin emojis.** Todo icono via `Icon.tsx` (SVG línea, currentColor). `ProductImage` cae a un placeholder con el icono de la categoría si falta la foto.

## Imágenes de producto (IA de Sanity)

Fotos generadas con `mcp__sanity__generate_image`, guardadas como assets de Sanity, URLs en `commerce/images.ts` (con `?w=700&q=80&auto=format`). Calidad muy buena para producto sobre fondo blanco.

**GOTCHA del pipeline** (documentado también en `/sanity-content-flow`):
- `generate_image` solo acepta un campo **image simple** o un **array DE IMÁGENES**. `demoSite.lifestyleGallery` es array de OBJETOS `{image, alt}` → **falla** (`Invalid imagePath`). Usar **`caseStudy.images`** (array de image) como doc scratch.
- Es **asíncrono**: tras llamar, hacer polling con `*[_id=="drafts.<id>"][0]{"n":count(images),"last":images[-1].asset->url}` hasta que `n` sea el esperado y `last` no sea null.
- Los **assets persisten** aunque se reasigne/borre el campo → se puede reutilizar un campo image simple (`hero.image`) sobrescribiéndolo y guardando la URL antes de la siguiente. Al final `discard_drafts` de los scratch (no borra assets).
- Para lotes grandes: N subagentes en paralelo, cada uno con SU doc scratch (evita carreras en el array), generando en secuencia con barrera de orden, devolviendo `{handle: url}`.

**Logo:** emblema (cesta) generado con IA, en `content.brand.logoUrl`, va con el wordmark "La Cesta" en tipografía real. Aprendido: para forma SIMPLE evitar la palabra "wicker/mimbre" (recarga el dibujo); a veces sale apaisado → recortar a cuadrado con `?w=200&h=200&fit=crop`. En el footer (fondo oscuro) el logo va en un chip blanco; en el nav (fondo blanco) directo con `mix-blend-mode: multiply`.

## Publicar en la galería `/ejemplos`

Necesita **thumbnail** + **`publishedToGallery: true`** + demo **desplegada** en prod. Orden para no dejar enlace roto:
1. Thumbnail = screenshot real del hero. Si el navegador MCP está bloqueado, usar la instancia de Playwright de `social-kit/node_modules` (script ad-hoc: goto `localhost:3001/la-cesta` con `waitUntil:"load"` + `waitForTimeout` porque en dev `networkidle` no llega; quitar el `[role="region"]` del DemoBanner; screenshot clip 1440×900 @2x). Subir a Sanity via HTTP: `POST https://gdtxcn4l.api.sanity.io/v2021-06-07/assets/images/production` con `Authorization: Bearer $SANITY_API_TOKEN` (de `apps/es/.env.local`) → devuelve `document._id` (`image-…`). Patchear `demoSite.thumbnail` con ese ref.
2. `commit` + `push` → esperar a que el deploy de demos esté **vivo** (verificar CONTENIDO, no solo 200: antes del deploy `/la-cesta` ya devolvía 200 con "plantilla no implementada"). Sondear `demos.ebecerra.es/la-cesta` hasta ver un marcador del contenido nuevo.
3. Solo ENTONCES `publishedToGallery: true` + publicar. La tarjeta aparece en `ebecerra.es/ejemplos` cuando `apps/es` revalide (ISR/webhook; en plan free el redeploy tarda ~10-15 min).

## Verificación al terminar

`npm run typecheck` limpio · lint (solo warnings `no-img-element`, se usan `<img>` a propósito) · `npx turbo run build --filter=@ebecerra/demos --force` (SSG de todas las rutas `/la-cesta`) · contraste ≥4.5 en todos los pares · testers `tester-visual-web`+`tester-dev`+`tester-seo-a11y` cuando el navegador MCP esté libre.
