-- Chatbot SaaS foundation: multi-tenant tables.
-- Aplicada vía MCP el 2026-05-21. Aditiva: extiende chatbot_messages existente con tenant_id (nullable temporalmente).
--
-- Doc de arquitectura: docs/chatbot-architecture-2026-05-20.md
-- Plan de implementación: docs/chatbot-implementation-plan-2026-05-20.md

-- ============================================================
-- 1. TENANTS — registro de cada web/cliente
-- ============================================================
create table public.tenants (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  config_source       text not null default 'sanity_proxy'
                        check (config_source in ('sanity_proxy','central_supabase','inline')),
  sanity_project_id   text,
  sanity_dataset      text,
  sanity_workspace    text,
  sanity_document_id  text,
  tenant_key_hash     text not null unique,
  tenant_key_prefix   text not null,
  status              text not null default 'active'
                        check (status in ('active','paused','archived')),
  monthly_message_limit  int not null default 5000,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index tenants_status_idx on public.tenants (status);
create index tenants_config_source_idx on public.tenants (config_source);
create index tenants_sanity_lookup_idx on public.tenants (sanity_project_id, sanity_document_id);

comment on table public.tenants is 'Registro de tenants del sistema chatbot multi-tenant. Cada web cliente es un tenant.';
comment on column public.tenants.tenant_key_hash is 'SHA-256 del raw tenant key. Nunca guardar el raw.';
comment on column public.tenants.config_source is 'sanity_proxy = config en Sanity del cliente, sync vía webhook | central_supabase = config en chatbot_configs_cache directo | inline = config hardcoded.';
comment on column public.tenants.sanity_document_id is 'ID del documento Sanity que contiene el config. Internos: profile, demoSite-xxx. Externos: chatbotConfig (singleton).';

-- ============================================================
-- 2. CONFIG CACHE — sincronizado desde Sanity del tenant
-- ============================================================
create table public.chatbot_configs_cache (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null unique references public.tenants(id) on delete cascade,
  system_prompt   text not null,
  greeting        text not null default 'Hola, ¿en qué puedo ayudarte?',
  tone            text not null default 'cordial'
                    check (tone in ('cordial','formal','cercano','tecnico')),
  language        text not null default 'es',
  business_info   jsonb not null default '{}'::jsonb,
  faqs            jsonb not null default '[]'::jsonb,
  primary_color   text not null default '#047857',
  position        text not null default 'bottom-right'
                    check (position in ('bottom-right','bottom-left')),
  avatar_url      text,
  bubble_label    text default '¿Necesitas ayuda?',
  model           text not null default 'llama-3.1-70b-versatile',
  synced_at       timestamptz not null default now(),
  source_revision text
);

comment on table public.chatbot_configs_cache is 'Cache de config sincronizado vía webhook desde Sanity del tenant. Lectura rápida en cada chat.';
comment on column public.chatbot_configs_cache.source_revision is 'Sanity document _rev para idempotencia de webhook.';

-- ============================================================
-- 3. CHATBOT_MESSAGES — extender existente con tenant_id (nullable)
-- ============================================================
alter table public.chatbot_messages
  add column tenant_id      uuid references public.tenants(id) on delete cascade,
  add column tokens_input   int default 0,
  add column tokens_output  int default 0,
  add column origin         text;

create index chatbot_messages_tenant_created_idx
  on public.chatbot_messages (tenant_id, created_at desc);
create index chatbot_messages_tenant_session_idx
  on public.chatbot_messages (tenant_id, session_id, created_at);

comment on column public.chatbot_messages.tenant_id is 'FK al tenant. Nullable temporalmente hasta migrar todos los mensajes existentes. NOT NULL en V2 tras drop de columna app.';

-- ============================================================
-- 4. USAGE — agregados mensuales para quota
-- ============================================================
create table public.chatbot_usage (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  period_start         date not null,
  conversations_count  int not null default 0,
  messages_count       int not null default 0,
  tokens_total         int not null default 0,
  unique (tenant_id, period_start)
);

comment on table public.chatbot_usage is 'Agregados mensuales para quota y futuro billing.';

-- ============================================================
-- 5. AUDIT LOG — seguridad y compliance
-- ============================================================
create table public.chatbot_audit_log (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid references public.tenants(id) on delete cascade,
  actor_email  text,
  action       text not null,
  details      jsonb,
  created_at   timestamptz not null default now()
);

create index chatbot_audit_log_tenant_idx on public.chatbot_audit_log (tenant_id, created_at desc);

-- ============================================================
-- 6. RLS — Row Level Security
-- ============================================================
alter table public.tenants                enable row level security;
alter table public.chatbot_configs_cache  enable row level security;
alter table public.chatbot_usage          enable row level security;
alter table public.chatbot_audit_log      enable row level security;

create policy operator_all_tenants on public.tenants
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_configs on public.chatbot_configs_cache
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_usage on public.chatbot_usage
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

create policy operator_all_audit on public.chatbot_audit_log
  for all using (
    auth.jwt() ->> 'email' in (
      select email::text from public.app_admins where role in ('owner','editor')
    )
  );

-- ============================================================
-- 7. Trigger: auto-update tenants.updated_at
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tenants_updated_at
  before update on public.tenants
  for each row
  execute function public.update_updated_at_column();
