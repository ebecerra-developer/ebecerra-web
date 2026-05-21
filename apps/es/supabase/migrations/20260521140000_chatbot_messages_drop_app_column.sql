-- Cleanup: el modelo multi-tenant usa tenant_id; la columna `app` legacy con
-- CHECK constraint a ['es','tech','demos','llaullau'] hace fallar inserts de
-- tenants nuevos (demo-equilibrio, llaullau como tenant, futuros) y también
-- los inserts del nuevo código que NO setea `app`. Los 17 mensajes legacy
-- sin tenant_id no tienen valor (confirmado por usuario).
--
-- Aplicada vía MCP el 2026-05-21 — bug encontrado en smoke test: el chat
-- respondía pero los mensajes no se persistían porque el INSERT violaba el
-- NOT NULL de `app`. El error era swallowed por el .catch fire-and-forget
-- del handler, así que aparentaba funcionar (audit log chat.completed) pero
-- no había trazabilidad de mensajes.

-- 1. Borrar mensajes legacy sin tenant_id.
delete from public.chatbot_messages where tenant_id is null;

-- 2. Drop columna app legacy (con su CHECK constraint).
alter table public.chatbot_messages drop column app;

-- 3. tenant_id ya puede ser NOT NULL — todos los mensajes a partir de ahora lo llevan.
alter table public.chatbot_messages alter column tenant_id set not null;

comment on column public.chatbot_messages.tenant_id is
  'FK al tenant. NOT NULL desde 20260521 — el modelo legacy con columna app fue eliminado.';
