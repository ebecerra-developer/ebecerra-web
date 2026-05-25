---
name: admin-panel
description: Panel de administración multi-tenant del ecosistema ebecerra. Úsalo al añadir un módulo nuevo (reservas, etc), provisionar un cliente nuevo con su admin, mapear tokens de marca al admin, o entender por qué algo del admin se ve raro.
---

# Admin panel — sistema reutilizable (V2 desde 2026-05-22)

Panel de admin **distribuido** (un front por cada dominio cliente) con backend SaaS centralizado en `admin.ebecerra.es`. Diseñado para ser **config-zero** al instalar en un cliente nuevo: solo `brand-bridge.css` + `_lib/modules.ts`.

## ⚠ Tenant nuevo → seedear `tenant_branding`

Al provisionar un cliente nuevo (`INSERT INTO public.tenants`), **siempre** crear su fila correspondiente en `public.tenant_branding` con su paleta + monograma + fuentes. Sin eso, el preview del Generador Social cae al default (verde ebecerra) y se ve mal.

```sql
insert into public.tenant_branding (tenant_id, bg, fg, primary_color, accent, monogram, font_display, font_body, notes)
values ((select id from public.tenants where slug = '<new-slug>'),
        '#bg', '#fg', '#primary', '#accent', 'XY', 'Display Font', 'Body Font',
        'Origen de la paleta');
```

Detalle de columnas en [[project-social-generator]]. Si cambias luego brand del cliente, mismo recordatorio en `/brand-identity` y `/design-tokens`.

## Stack canónico

- **SDK**: [`packages/client-admin-sdk/`](../../../packages/client-admin-sdk/) (`@ebecerra/client-admin-sdk`, v0.1.0). Workspace dep en apps/* del monorepo. Vendor copy en `llaullau-web/lib/admin-sdk/` para repos externos.
- **Backend auth**: `apps/es/app/api/auth/*` y `apps/es/app/api/admin/*` servidos desde `admin.ebecerra.es`. Magic link 15min, SESSION_SECRET firma JWT-like.
- **DB**: tabla `app_admins(email citext PK, role, tenant_id, notes)`. `tenants.admin_base_url` redirige el magic link tras verify.
- **Estética**: 4 tonos progresivos (`--admin-surface` → `--admin-bg` → `--admin-surface-2` → `--admin-bg-deep`), sin gradientes, nav activo con underline (no botón redondeado). Detallado en memoria [[feedback-admin-styling]].

## Anatomía de un admin (consumidor del SDK)

```
app/admin/
├── layout.tsx                   ← importa admin-base.css + brand-bridge.css
├── brand-bridge.css             ← mapea tokens propios → var(--admin-*)
├── page.tsx                     ← index con <ModuleGrid> envuelto en AuthShell
├── login/page.tsx               ← <LoginForm> dentro de .admin-shell
├── verify/page.tsx              ← <VerifyHandler> dentro de .admin-shell
├── _lib/
│   ├── AuthShell.tsx            ← server wrapper: requireSession + <AdminLayout>
│   └── modules.ts               ← BRAND + MODULES registry
└── <module>/                    ← chatbot, bookings, etc.
    └── page.tsx                 ← envuelve en <AuthShell activeModule="...">
```

API routes en paralelo en `app/api/auth/{login,verify,logout}` y `app/api/admin/<module>/*` usando los builders del SDK (`buildAuthLoginHandler()`, `buildAdminProxyHandler("/api/admin/...")`).

Para apps/demos (multi-tenant por slug), todo eso vive bajo `app/admin/[slug]/...` con cookie path scoped a `/admin/<slug>` y API routes en `app/admin/[slug]/api/...`.

## Operativa

### Añadir un módulo nuevo (ej: reservas)

1. Crear `app/admin/<module>/page.tsx` envuelto en `<AuthShell activeModule="<key>">`.
2. Añadir entry al array de `app/admin/_lib/modules.ts`:
   ```ts
   { key: "bookings", label: "Reservas", description: "...", href: "/admin/bookings", icon: "📅" }
   ```
3. Si el módulo necesita backend, crear handlers en `app/api/admin/<module>/*` usando `buildAdminProxyHandler("/api/admin/<module>")` del SDK.
4. Listo — aparece en sub-nav (sticky con underline en activo) y en el `<ModuleGrid>` del `/admin`.

### Provisionar el admin para un cliente nuevo

Pre-requisitos: tenant ya provisionado en `tenants` con su `tenant_key`, `admin_base_url`, etc. (ver skill `/chatbot-system` para crear tenants).

Pasos en el repo del cliente:
1. Copiar `lib/admin-sdk/` desde llaullau-web (vendor copy) o añadir workspace dep `"@ebecerra/client-admin-sdk": "*"` si está dentro del monorepo.
2. `app/admin/layout.tsx` import:
   ```tsx
   import "@/lib/admin-sdk/styles/admin-base.css";  // o "@ebecerra/client-admin-sdk/styles/admin-base.css"
   import "./brand-bridge.css";
   ```
3. Escribir `app/admin/brand-bridge.css` mapeando los tokens de marca a `--admin-*`. Las 4 vars de layering son las críticas — ver sección abajo.
4. Crear `app/admin/_lib/modules.ts` con `BRAND` (nombre + tagline) y `MODULES` (array inicial con chatbot al menos).
5. Crear `app/admin/_lib/AuthShell.tsx` (copia el patrón de llaullau o apps/tech).
6. Crear `/admin/page.tsx`, `/admin/login/page.tsx`, `/admin/verify/page.tsx` siguiendo plantilla.
7. Env vars Vercel: `ADMIN_API_URL=https://admin.ebecerra.es` + `SESSION_SECRET` (32 bytes hex, `node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'`) + `CHATBOT_TENANT_KEY=tk_live_...` del tenant.
8. En `proxy.ts` (o `middleware.ts` en Next ≤15), bypass de i18n para `/admin/*`:
   ```ts
   if (request.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();
   ```
9. Whitelistear al operador (y opcionalmente al cliente con role='client') en `app_admins`:
   ```sql
   INSERT INTO app_admins (email, role, tenant_id, notes)
   VALUES ('cliente@email.com', 'client', '<uuid del tenant>', 'descripción');
   ```

### Brand-bridge.css — las 4 vars críticas

```css
.admin-shell {
  /* Layering tonal (lightest a darkest, progresivo) */
  --admin-surface: <cream/light>;     /* cards elevadas */
  --admin-bg: <medium>;                /* main area (suelo) */
  --admin-surface-2: <deeper>;         /* sub-nav recess */
  --admin-bg-deep: <darkest>;          /* header + footer */

  /* Borders */
  --admin-border: <subtle>;
  --admin-border-strong: <visible>;

  /* Text */
  --admin-text: <darkest>;
  --admin-text-soft: <medium>;
  --admin-text-muted: <light>;

  /* CTA / acento — el primary de la marca del cliente */
  --admin-primary: <brand-cta>;
  --admin-primary-strong: <brand-cta-hover>;
  --admin-primary-soft: <brand-cta @ 14-18% alpha>;
  --admin-on-primary: <ink on cta>;
  --admin-accent: <secondary-accent>;  /* badges, decoración */

  /* Fonts (opcional, hereda defaults sans/serif/mono si no se setea) */
  --admin-font: var(--font-sans, ...);
  --admin-font-display: var(--font-display, ...);
}
```

Para multi-tenant en mismo dominio (apps/demos), añadir variantes `[data-template="..."]` que sobreescriban las mismas vars. El AdminLayout acepta prop `templateAttr` que se traduce a `data-template` en el shell.

### Verificar que un admin se ve bien

Smoke test visual:
- Header (bg-deep) distinto del main (bg) distinto del sub-nav (surface-2) — 3 tonos visibles.
- Cards (surface) más claras que el main, **flotan** (efecto Stripe/Notion).
- Sub-nav activo: texto color primary + underline recto 2px (no botón redondeado).
- Hover de links del nav: cambio de bg sutil al color del main.
- Avatar circulito con iniciales del email (no foto), color sólido primary.
- Footer fino con © cliente + versión.

Anti-patrones que el user ha vetado:
- Página "casi toda blanca" — todas las superficies en el mismo tono.
- Gradientes (linear, radial) en bg, avatar o progress bars.
- Active del nav como botón redondeado.
- Cards más oscuras que el main (efecto "hundido" en vez de "flotando").

### Mover de single-tenant a multi-tenant en mismo dominio

Si un admin existente (ej: ebecerra.tech) en algún momento necesita servir a varios tenants:
1. Mover `/admin/...` a `/admin/[slug]/...`.
2. AuthShell pasa a `({ slug, activeModule, children })` y resuelve tenant key vía un mapa.
3. Cookie path scoped a `/admin/<slug>` (parametro `cookiePath` en `buildAuth*Handler`).
4. Brand y modules pasan a factories `brandForSlug(slug)`, `modulesForSlug(slug)`.

Patrón completo en `apps/demos/app/admin/[slug]/` — copiar la estructura.

## Borrar / mover sesiones de chatbot del admin

El admin solo lee. Para purgar:
```sql
DELETE FROM chatbot_messages WHERE session_id = '<uuid>';
```
Verificar primero el tenant correcto con `JOIN tenants ON ...` para no borrar de otro cliente por accidente.

## Pendientes (futuro)

- `/admin/chatbot/audit` en ebecerra.es — vista global cross-tenant para el operador.
- `/admin/access` en ebecerra.es — UI para gestionar whitelist sin SQL.
- UserMenu con preferencias (idioma, density) cuando crezca el admin.
- Módulo de reservas (cuando llegue el cliente).

## Memorias relacionadas

- [[admin-panel]] — arquitectura completa, tenants, paths.
- [[feedback-admin-styling]] — reglas de estilo del admin (sin gradientes, layering).
- [[reference-vercel-env-vars]] — env vars por proyecto Vercel.
- [[chatbot-system]] — provisionar tenants nuevos.
