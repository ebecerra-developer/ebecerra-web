# Setup — Generador Social

Pasos pendientes tras el primer commit del módulo. Solo se hacen una vez.

## 1. Secrets en GitHub Actions

Repo Settings → Secrets and variables → **Actions** → New repository secret.

| Secret name | Valor | Origen |
|---|---|---|
| `SUPABASE_URL` | `https://cpqotqskwubsizaacrnf.supabase.co` | Project URL |
| `SUPABASE_SECRET_KEY` | `sb_secret_...` | El mismo que `SUPABASE_SECRET_KEY` de `apps/es/.env.local` |

> Sin estos secrets el workflow falla con error de auth de Supabase en el primer step que toca DB.

## 2. Env vars en Vercel (proyecto apps/es)

Settings → Environment Variables. Production + Preview.

| Env var | Valor | Notas |
|---|---|---|
| `GITHUB_DISPATCH_TOKEN` | `ghp_...` (PAT fine-grained) | Marca como **Sensitive**. Permisos: Actions r/w + Contents r. |
| `GITHUB_SOCIAL_WORKER_REPO` | `ebecerra-developer/ebecerra-web` | Formato `owner/repo` plano. |

## 3. (Opcional) Permitir clientes en sus admins

Por defecto solo los operators (role `owner`/`editor`) ven la pestaña "Social". Para dar acceso a un cliente concreto:

```sql
update public.app_admins
set permissions = permissions || '{"social": true}'::jsonb
where email = 'cliente@dominio.com';
```

## 4. Validación end-to-end

1. `npm run dev:es` → entrar a `/admin/social` autenticado como operator.
2. Click en "Lista negativa (post 4:5)".
3. Rellenar campos (vienen con defaults).
4. Click "Generar".
5. Redirige a `/admin/social/job/<uuid>` y muestra estado `queued` → `rendering` → `done`.
6. Tras ~30-60s aparece el PNG renderizado con botón de descarga.

Si falla, el botón "Ver run en GitHub Actions" lleva a los logs detallados.

## Arquitectura (recordatorio)

```
[Admin UI] ──POST /api/admin/social/render──► [apps/es Route Handler]
                                                       │
                                                       │ 1. crea fila en social_render_jobs (status=queued)
                                                       │ 2. dispatch workflow vía GitHub REST API
                                                       ▼
                                              [GitHub Actions runner]
                                                       │
                                                       │ npm install + playwright install chromium
                                                       │ node render-job.mjs
                                                       │
                                                       │ 3. lee job de Supabase, marca rendering
                                                       │ 4. carga template + branding del tenant
                                                       │ 5. Playwright → PNG
                                                       │ 6. upload a Storage bucket social-renders
                                                       │ 7. marca done + storage_path
                                                       ▼
                                              [Admin UI polling /api/admin/social/jobs/:id]
                                                       │
                                                       │ recibe status=done + signedUrl
                                                       ▼
                                              [Vista del PNG + descarga]
```

Cron `pg_cron` borra renders > 30 días + jobs failed > 7 días + audit > 90 días, cada noche a las 03:00 UTC.

## Cuotas free tier (referencia)

- **GitHub Actions**: 2.000 min/mes — cada render estático ~1 min → 2.000 renders/mes
- **Supabase Storage**: 1GB — ~2.000 PNG de 4:5 antes de saturar. El cron limpia a 30 días.

Cuando se acerque el límite, migrar Storage a Cloudflare R2 (10GB free).
