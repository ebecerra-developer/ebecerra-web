---
name: deployment-sanity-webhook
description: Configuración operativa de Vercel, dominios, env vars, webhooks de Sanity y CORS. Úsalo al tocar deploys, rotar secrets, hacer cutover de DNS, añadir un dominio nuevo, o diagnosticar por qué no se revalidan los cambios publicados en Sanity.
---

# Deployment, webhooks y env vars — ebecerra-web

## Proyectos Vercel

| Proyecto | Rama de prod | Root Directory | Dominios |
|---|---|---|---|
| `ebecerra-es` | `main` | `apps/es` | `ebecerra.es`, `www.ebecerra.es` |
| `ebecerra-tech` | `main` | `apps/tech` | `ebecerra.tech`, `www.ebecerra.tech` |

Ambos proyectos apuntan al **mismo repo** (`ebecerra-web`). Ignored Build Step con `npx turbo-ignore @ebecerra/es` (o `@ebecerra/tech`) evita rebuilds innecesarios cuando solo cambia la otra app o docs.

## Env vars por proyecto

| Variable | Dónde | Notas |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Ambos | `gdtxcn4l` |
| `NEXT_PUBLIC_SANITY_DATASET` | Ambos | `production` |
| `SANITY_API_READ_TOKEN` | Ambos | token lectura, scope restringido |
| `SANITY_REVALIDATE_SECRET` | Ambos | **mismo valor en ambos** |
| `RESEND_API_KEY` | Ambos | verificar dominio en Resend primero |
| `CONTACT_TO_EMAIL` | Ambos | email destino del form |
| `CONTACT_FROM_EMAIL` | Opcional | remitente si difiere del default |

Formato completo en `apps/<app>/.env.local.example`.

## Webhook de revalidación Sanity

**Un webhook por dominio activo.** El proyecto Sanity `gdtxcn4l` es compartido — un publish dispara todos los webhooks configurados.

### URLs de los webhooks (CRÍTICO: trailing slash obligatoria)

```
https://ebecerra.es/api/revalidate/?secret=<SANITY_REVALIDATE_SECRET_URL_ENCODED>
https://ebecerra.tech/api/revalidate/?secret=<SANITY_REVALIDATE_SECRET_URL_ENCODED>
```

**La trailing slash es obligatoria** porque `next.config.ts` tiene `trailingSlash: true`. Sin ella, Next.js responde 308 Permanent Redirect y Sanity no sigue redirects en POST → el webhook nunca llega.

**El secret debe ir URL-encoded** en la query string. Los caracteres `+` → `%2B` y `=` → `%3D`. Ejemplo con el secret actual:

```
?secret=iojeiPbNrCzbE0%2BPpGKglgUUlQQRbe9YQEIZAdLog7s%3D
```

### Configuración del webhook en manage.sanity.io

| Campo | Valor |
|---|---|
| Dataset | `production` |
| Trigger on | Create + Update + Delete (los 3) |
| Filter | `!(_id in path("drafts.**"))` |
| Versions | **activado** (sin esto no dispara al publicar desde versiones) |
| HTTP method | POST |
| API version | v2021-03-25 |
| Secret | dejar vacío — el secret va en la URL |

### Secret en 3 sitios — mantener sincronizados

1. `apps/<app>/.env.local` — dev local.
2. Vercel env vars del proyecto (Production + Preview + Development).
3. Query string de la URL del webhook en Sanity.

Si rotas el secret, **rota en los 3 a la vez** o el webhook devuelve 401.

### Sanity client — useCdn debe ser false

`packages/sanity-client/client.ts` tiene `useCdn: false`. **No cambiarlo a `true`.**

Con `useCdn: true`, el CDN de Sanity cachea respuestas independientemente del ciclo ISR de Next.js — los publishes no se reflejan hasta que expira el cache del CDN (minutos/horas). Next.js ISR ya gestiona el caching; Sanity no necesita su propio CDN encima.

### revalidatePath — usar "layout" para rutas dinámicas

`apps/es/app/api/revalidate/route.ts` usa `revalidatePath("/", "layout")` para la home.

Con route groups `(locale)/[locale]`, `revalidatePath("/", "page")` no invalida correctamente todas las variantes del segmento dinámico. `"layout"` invalida todo el árbol desde la raíz y funciona correctamente.

### Qué revalida cada tipo

| `_type` del body | Paths revalidados |
|---|---|
| `faqItem`, `faqPage` | `/faq`, `/en/faq` |
| `legalPage` | `/<slug>`, `/en/<slug>` |
| cualquier otro (home) | `/`, `/en` (vía layout) |

Si añades rutas estáticas nuevas, añadirlas también en `route.ts`.

### Diagnóstico: "publiqué en Sanity y no veo el cambio"

1. **Hard refresh** (`Ctrl+Shift+R`) — descarta cache de navegador.
2. **Verificar que el webhook llegó** — en `manage.sanity.io` → Webhooks → el webhook → historial de intentos. Si no hay delivery reciente con 200, el webhook no está llegando.
3. **Trailing slash** — ¿la URL del webhook tiene `/` al final antes del `?`? Sin ella devuelve 308 y Sanity no sigue el redirect.
4. **Secret URL-encoded** — ¿el `+` está como `%2B` y el `=` como `%3D` en la URL?
5. **Checkbox "Versions"** — ¿está activado en la config del webhook?
6. **Forzar revalidación manual** para descartar el webhook como causa:
   ```powershell
   Invoke-RestMethod -Method POST -Uri "https://ebecerra.es/api/revalidate/?secret=..." -ContentType "application/json" -Body '{"_type":"service"}'
   ```
   Si devuelve `{"revalidated":true,...}` el endpoint funciona — el problema está en el webhook de Sanity.
7. **useCdn** — ¿`packages/sanity-client/client.ts` tiene `useCdn: false`?

## CORS origins en Sanity

Configurar en `manage.sanity.io` → proyecto `gdtxcn4l` → API → CORS Origins:

- `https://ebecerra.es` ✓
- `https://www.ebecerra.es` ✓
- `https://ebecerra.tech` ✓
- `https://www.ebecerra.tech` ✓
- `http://localhost:3000` ✓
- `https://localhost:3000` ✓

## Resend — verificación de dominio

Antes de usar `/api/contact` en prod de un dominio:

1. Abrir Resend dashboard → Domains → Add domain (`ebecerra.es`).
2. Resend da registros DNS (SPF, DKIM, DMARC).
3. Añadir en Vercel DNS (Settings → Domains → el dominio → DNS Records).
4. Verificar en Resend (puede tardar minutos). Provider aparece como "Vercel".
5. Generar `RESEND_API_KEY` → setear en Vercel env vars junto con `CONTACT_TO_EMAIL`.

Sin dominio verificado, Resend solo permite enviar al owner de la cuenta.

## Reglas operativas

- **No subir `.env.local` a git.** Está en `.gitignore` pero vigilar.
- **No rotar secrets antes de una demo** — hay ventana de inconsistencia mientras se actualizan los 3 sitios.
- **Los previews de Vercel NO tienen webhook apuntándoles.** Para probar en preview, disparar revalidate manualmente.
- **`turbo-ignore` puede marcar un commit como skipped** si el diff toca solo la otra app — es correcto. Forzar rebuild desde el dashboard si hace falta.
- **Ambas apps comparten el mismo proyecto Sanity** (`gdtxcn4l`/`production`) — un publish en Studio revalida las dos si ambos webhooks están configurados.
