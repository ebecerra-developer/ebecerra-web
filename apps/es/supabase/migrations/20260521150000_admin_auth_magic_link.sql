-- Auth multi-tenant para el /admin de cada web cliente:
-- Magic link sin OAuth provider; email + tenant_id en app_admins; redirect URL por tenant.
--
-- Modelo de usuario:
-- - role='owner' o 'editor' + tenant_id NULL → operador (acceso a todos los tenants)
-- - role='client' + tenant_id NOT NULL → cliente de ese tenant únicamente

-- 1. Extender app_admins con tenant_id
alter table public.app_admins
  add column tenant_id uuid references public.tenants(id) on delete cascade;

create index app_admins_tenant_email_idx on public.app_admins (tenant_id, email);

comment on column public.app_admins.tenant_id is
  'NULL = operator (acceso a todos los tenants). NOT NULL = client restringido a ese tenant.';

-- 2. Extender tenants con la URL base del admin del cliente
alter table public.tenants
  add column admin_base_url text;

comment on column public.tenants.admin_base_url is
  'Origin del admin del cliente, ej. "https://llaullau.com". El backend construye verify link como admin_base_url + "/admin/verify?token=…". Solo URLs aquí registradas son destino válido del magic link.';

-- 3. Magic link tokens
create table public.magic_link_tokens (
  id           uuid primary key default gen_random_uuid(),
  token_hash   text not null unique,
  email        citext not null,
  tenant_id    uuid not null references public.tenants(id) on delete cascade,
  ip           text,
  user_agent   text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  used_at      timestamptz
);

create index magic_link_tokens_email_tenant_idx on public.magic_link_tokens (email, tenant_id);
create index magic_link_tokens_expires_idx on public.magic_link_tokens (expires_at);

comment on table public.magic_link_tokens is
  'Tokens one-time para login en admin de cada tenant. Caducan a 15 min. Se hashea raw → hash. El raw solo viaja en el email.';

-- 4. RLS — todas las operaciones server-side con service_role
alter table public.magic_link_tokens enable row level security;

-- 5. Limpieza periódica (opcional)
create or replace function public.cleanup_expired_magic_links()
returns int
language plpgsql
as $$
declare
  deleted int;
begin
  delete from public.magic_link_tokens
   where expires_at < now() - interval '24 hours';
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

comment on function public.cleanup_expired_magic_links() is
  'Borra tokens caducados hace más de 24h. Llamable desde cron.';
