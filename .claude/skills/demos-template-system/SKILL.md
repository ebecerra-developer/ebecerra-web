---
name: demos-template-system
description: Cómo añadir una plantilla nueva a apps/demos (dental, asesoría, restaurante…) — arquitectura del sistema multi-template, qué reutilizar y qué no, división coordinador/subagentes, gotcha de createPortal scope. Úsalo cuando vayas a crear una plantilla `demoSite` nueva o a entender por qué las demos existentes están separadas.
---

# Demos template system — apps/demos

`demos.ebecerra.es` aloja varias demos navegables sobre el mismo motor (`apps/demos`, schema `demoSite`) pero con plantillas **independientes**, no temas repintados. Esta skill cubre cómo añadir una nueva.

## Principio fundamental — "cada demo merece su plantilla"

Si dos demos comparten estructura, componentes y paleta familiar (aunque cambien tres colores), parecen el mismo template repetido y arruinan el argumento comercial de "webs a medida". Aprendido en duro tras el primer intento (2026-05-10) de crear `coach-editorial` y `coach-vibrant` como variantes con `brandOverrides` sobre una plantilla `coach` única — fue eliminado y reescrito como dos plantillas con componentes propios.

**Regla:** una plantilla por carril visual diferenciado (no por sector — un sector puede necesitar varias plantillas si los avatares son distintos). Las plantillas activas hoy:

- `fisio` — clínica/salud calmada (Equilibrio).
- `coach-editorial` — premium femenino sofisticado (Marta Solana).
- `coach-vibrant` — marca personal joven (Claudia Entrena).

Antes de crear `dental` o `asesoria`: pregúntate cuántos avatares distintos vas a representar. Si una asesoría boutique premium y una asesoría online low-cost van a coexistir, son dos plantillas, no una con paleta.

## Qué se reutiliza vs qué es propio

| Qué | Decisión |
|---|---|
| Lógica cliente con estado (form contacto, drawer mobile) | **Reutilizar** (`FisioContactForm`, `FisioNavMobile`) — pasa `templateScope` para tokens correctos en el portal. Ver gotcha abajo. |
| Tipos TS (`DemoSite`, `DemoBrandOverrides`, etc.) | **Reutilizar** desde `@ebecerra/sanity-client`. |
| Helper `urlFor` (Sanity image-url) | **Reutilizar** desde `@/lib/image`. |
| `<Nav>`, `<Hero>`, `<About>`, `<Services>`, `<BannerCta>`, `<Testimonials>`, `<Footer>` | **Propios** por plantilla. Son los protagonistas visuales. |
| Tokens (paleta, tipografía, scale, radii, shadows) | **Propios** en `packages/tokens/demos-<template>.css` con scope `[data-template="<template>"]`. |
| Secciones opcionales (booking, pricing, IG feed, lifestyle gallery) | **Solo si encajan con el avatar.** Ej: coach editorial publica precios + booking note; coach vibrant capta por DM (sin pricing, sin booking). No incluir "porque ya está hecho". |

## Estructura de archivos al añadir una plantilla nueva

```
packages/tokens/demos-<template>.css         ← scope [data-template="<template>"]
apps/demos/components/templates/<template>/
├── <Pascal>Template.tsx                     ← orquesta, renderiza shell con data-template
├── <Pascal>Template.module.css
├── <Pascal>Nav.tsx + .module.css            ← propio
├── <Pascal>Hero.tsx + .module.css           ← propio
├── <Pascal>Stats.tsx + .module.css          ← (opcional, si demo usa coachStats[])
├── <Pascal>About.tsx + .module.css          ← propio
├── <Pascal>Services.tsx + .module.css       ← propio
├── <Pascal>Objectives.tsx + .module.css     ← (opcional)
├── <Pascal>Pricing.tsx + .module.css        ← (opcional, condicionado a pricing.enabled)
├── <Pascal>BannerCta.tsx + .module.css      ← propio
├── <Pascal>Testimonials.tsx + .module.css   ← propio
├── <Pascal>InstagramFeed.tsx + .module.css  ← (opcional, condicionado a instagramFeed.enabled)
├── <Pascal>Contact.tsx + .module.css        ← propio (puede reusar FisioContactForm)
└── <Pascal>Footer.tsx + .module.css         ← propio
```

## Flujo paso a paso

### Coordinador (yo)

1. **Schema (`packages/sanity-schemas/schemas/demoSite.ts`):** añadir el valor del template al enum `template.options.list`. Si la plantilla necesita campos nuevos no existentes (ej. `instagramFeed`, `pricing`), añadirlos como opcionales — todos los docs deben seguir siendo válidos. Ver `packages/sanity-client/types.ts` para extender tipos.
2. **`npx sanity schema deploy` desde `apps/es/`** (no desde la raíz). Verificar que el enum nuevo aparece en el Studio.
3. **Tokens (`packages/tokens/demos-<template>.css`):** scope `[data-template="<template>"]`, define `--bg`, `--bg-deep`, `--surface`, `--ink`, `--cta`, `--accent`, todas las `--text-*`, tipografía (`--font-display-stack`, `--font-sans-stack` apuntando a fuentes ya cargadas en `apps/demos/app/[locale]/layout.tsx` con `next/font/google`), scale (`--fs-*`), spacing, radii, shadows. **No depender de los tokens de otra plantilla.**
4. **Importar tokens en `apps/demos/app/globals.css`** después de los existentes.
5. **Componentes en `apps/demos/components/templates/<template>/`** — ver tabla "qué se reutiliza" arriba. CSS Modules co-located, sin `style={{}}`. Tokens vía `var(--…)`.
6. **Wiring en `apps/demos/app/[locale]/[slug]/page.tsx`:** añadir branch al switch por `demo.template`.
7. **Si el Nav necesita drawer mobile, reutilizar `FisioNavMobile` y pasar `templateScope="<template>"`** — sin esto el portal hereda fisio (ver gotcha).
8. **Build (`npx turbo run build --filter=@ebecerra/demos --force`)** y verificar typecheck.

### Subagente (uno por demo a poblar)

Brief firme con: avatar concreto, paleta dirección con hex, naming convention (nombre+apellido sobrio para premium, alias handle estilo IG para marca personal, etc.), tono copy, restricciones (`pricing.enabled`, `instagramFeed.enabled` según avatar), número de imágenes IA. El subagente **solo toca Sanity** (docs + Media Library), nunca código. Tras terminar:

- Verifica typecheck/build local.
- Lighthouse mobile ≥ 90 en cada demo nueva.
- Visualiza las demos publicadas en `/ejemplos` — confirma que NO parecen primas (paletas, tipografías, layouts distintos).

## Gotcha: `createPortal` y scope de tokens

`FisioNavMobile` (drawer hamburger reusado por todas las plantillas) renderiza el drawer vía `createPortal(drawer, document.body)`. El portal sale del shell con `data-template`, los tokens scopeados a `[data-template="..."]` no se aplican y el drawer cae al `:root` de `demos-fisio.css`.

**Fix obligatorio:** prop `templateScope` (default `"fisio"`) que envuelve el contenido del portal en `<div data-template={templateScope}>`. Cada Nav nuevo debe pasarlo. Ver `apps/demos/components/templates/fisio/FisioNavMobile.tsx`.

Lo mismo aplica a cualquier futuro modal/popover con portal: añade `data-template` al wrapper del portal.

## Avatares y naming convention probados

- **Premium / clínico**: nombre + apellido ficticio sobrio (ej. *Marta Solana*). Slug `nombre-apellido`. Tono cuidados, autoridad.
- **Marca personal redes**: handle alias estilo IG (ej. *@claudia.entrena*). Slug `handle-con-guiones`. Tono coloquial, capta por DM.
- **Sector profesional/B2B** (asesoría, abogados): apellido + sector (*Asesoría Núñez*). Tono pragmático, autoridad.

## Anonimización obligatoria

Toda demo pública lleva datos visiblemente fake:

- Teléfono: `+34 600 00 00 00` y WhatsApp `wa.me/34600000000` (patrón aplicado a las 3 demos actuales).
- Email: `hola@<slug>.es` o `.com` — dominios no comprados.
- Direcciones: ciudad + barrio, sin dirección postal real.
- Testimonios: autor con nombre + inicial.
- Imágenes: IA-generadas, nunca reales.
- Logos: sin logo (texto businessName) salvo en demos privadas branded (ej. F7 BeeMovement).

## Verificación final

1. `npm run typecheck` limpio (todo el monorepo).
2. `npx turbo run build --filter=@ebecerra/demos --force` genera estáticamente todas las rutas `/<locale>/<slug>`.
3. Mobile drawer en cada plantilla muestra la paleta correcta (no la de fisio).
4. `ebecerra.es/ejemplos` muestra las 3+ cards con thumbnails distintos.
5. Webhook fan-out: publicar un cambio en Sanity y verificar revalidación en < 30s.

## Archivos críticos

- `packages/sanity-schemas/schemas/demoSite.ts` — enum + campos opcionales nuevos.
- `packages/sanity-client/types.ts` + `queries.ts` — tipos y projection GROQ.
- `packages/tokens/demos-<template>.css` — tokens propios.
- `apps/demos/app/globals.css` — import de tokens nuevos.
- `apps/demos/app/[locale]/layout.tsx` — `next/font/google` para fuentes nuevas.
- `apps/demos/app/[locale]/[slug]/page.tsx` — switch por template.
- `apps/demos/components/templates/<template>/` — componentes propios.
- `apps/demos/components/templates/fisio/FisioNavMobile.tsx` — `templateScope` prop (NO modificar la lógica, solo pasarlo desde tu Nav).
