import { getSupabase } from "./client";

export type PersistMessageInput = {
  tenant_id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  model?: string | null;
  tokens_input?: number;
  tokens_output?: number;
  origin?: string | null;
};

export async function persistMessage(input: PersistMessageInput): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("chatbot_messages").insert({
    tenant_id: input.tenant_id,
    session_id: input.session_id,
    role: input.role,
    content: input.content,
    model: input.model ?? null,
    tokens_input: input.tokens_input ?? 0,
    tokens_output: input.tokens_output ?? 0,
    origin: input.origin ?? null,
    // app column existe en la tabla pero ya no se usa para tenants nuevos.
    // Inserta NULL en app (la columna es nullable y se eliminará en V2).
  });

  if (error) throw error;
}

export type ListMessagesOptions = {
  tenantId: string;
  sessionId?: string;
  from?: string; // ISO date
  to?: string;
  limit?: number;
  offset?: number;
};

export type MessageRow = {
  id: string;
  tenant_id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_input: number;
  tokens_output: number;
  origin: string | null;
  created_at: string;
};

export async function listMessages(opts: ListMessagesOptions): Promise<MessageRow[]> {
  const supabase = getSupabase();
  let q = supabase
    .from("chatbot_messages")
    .select(
      "id,tenant_id,session_id,role,content,model,tokens_input,tokens_output,origin,created_at"
    )
    .eq("tenant_id", opts.tenantId)
    .order("created_at", { ascending: false });

  if (opts.sessionId) q = q.eq("session_id", opts.sessionId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  const limit = Math.min(opts.limit ?? 50, 200);
  q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + limit - 1);

  const { data, error } = await q;
  if (error) throw error;
  return (data as MessageRow[]) ?? [];
}

/**
 * Lista de sesiones únicas (con metadata) para vista agrupada en admin.
 */
export type SessionSummary = {
  session_id: string;
  message_count: number;
  first_at: string;
  last_at: string;
};

export async function listSessions(
  tenantId: string,
  opts?: { limit?: number }
): Promise<SessionSummary[]> {
  const supabase = getSupabase();
  // Aggregation: usamos una RPC sería ideal, pero para V1 sacamos último N mensajes y agrupamos en JS.
  // Suficiente para V1 con tenants pequeños. V2 → RPC SQL si hace falta.
  const { data, error } = await supabase
    .from("chatbot_messages")
    .select("session_id,created_at")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (error) throw error;
  const rows = (data ?? []) as { session_id: string; created_at: string }[];
  const map = new Map<string, SessionSummary>();
  for (const r of rows) {
    const existing = map.get(r.session_id);
    if (existing) {
      existing.message_count += 1;
      if (r.created_at < existing.first_at) existing.first_at = r.created_at;
      if (r.created_at > existing.last_at) existing.last_at = r.created_at;
    } else {
      map.set(r.session_id, {
        session_id: r.session_id,
        message_count: 1,
        first_at: r.created_at,
        last_at: r.created_at,
      });
    }
  }
  const sessions = Array.from(map.values()).sort((a, b) =>
    a.last_at < b.last_at ? 1 : -1
  );
  return sessions.slice(0, opts?.limit ?? 50);
}
