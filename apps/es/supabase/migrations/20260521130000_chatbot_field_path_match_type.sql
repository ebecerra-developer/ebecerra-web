-- Fix bugs descubiertos al verificar profile.ts:
--  1. apps-tech usa profile.chatbotTech (no profile.chatbot)
--  2. apps-demos debe matchear por _type (cada demoSite tiene _id distinto)
--
-- Aditiva: añade dos columnas a tenants + backfill de apps-tech y apps-demos.

alter table public.tenants
  add column sanity_match_type text not null default 'document_id'
    check (sanity_match_type in ('document_id','document_type')),
  add column sanity_field_path text default 'chatbot';

comment on column public.tenants.sanity_match_type is
  'Cómo matchear payload del webhook: document_id (exact en _id) | document_type (en _type, cubre N docs).';
comment on column public.tenants.sanity_field_path is
  'Subcampo del doc Sanity que contiene el config. NULL para chatbotConfig (top-level). Default chatbot. Apps-tech: chatbotTech.';

create index tenants_match_type_value_idx
  on public.tenants (sanity_match_type, sanity_document_id);

update public.tenants set sanity_field_path = 'chatbotTech' where slug = 'apps-tech';
update public.tenants set sanity_match_type = 'document_type' where slug = 'apps-demos';
