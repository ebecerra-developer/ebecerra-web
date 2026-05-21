import { getSupabase } from "./client";

function firstOfMonth(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export type UsageRow = {
  tenant_id: string;
  period_start: string;
  conversations_count: number;
  messages_count: number;
  tokens_total: number;
};

export async function getCurrentUsage(tenantId: string): Promise<UsageRow> {
  const supabase = getSupabase();
  const period = firstOfMonth();
  const { data, error } = await supabase
    .from("chatbot_usage")
    .select("tenant_id,period_start,conversations_count,messages_count,tokens_total")
    .eq("tenant_id", tenantId)
    .eq("period_start", period)
    .maybeSingle();

  if (error) throw error;
  return (
    (data as UsageRow) ?? {
      tenant_id: tenantId,
      period_start: period,
      conversations_count: 0,
      messages_count: 0,
      tokens_total: 0,
    }
  );
}

export async function incrementUsage(
  tenantId: string,
  delta: { messages?: number; tokens?: number; newConversation?: boolean }
): Promise<void> {
  const supabase = getSupabase();
  const period = firstOfMonth();
  // Upsert "manual" — leer + sumar + upsert. Para tenants con tráfico muy alto convendría
  // una RPC atómica. V1 sirve.
  const current = await getCurrentUsage(tenantId);
  const next: UsageRow = {
    tenant_id: tenantId,
    period_start: period,
    conversations_count:
      current.conversations_count + (delta.newConversation ? 1 : 0),
    messages_count: current.messages_count + (delta.messages ?? 0),
    tokens_total: current.tokens_total + (delta.tokens ?? 0),
  };
  const { error } = await supabase
    .from("chatbot_usage")
    .upsert(next, { onConflict: "tenant_id,period_start" });

  if (error) throw error;
}

export async function getUsageHistory(
  tenantId: string,
  months: number = 6
): Promise<UsageRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chatbot_usage")
    .select("tenant_id,period_start,conversations_count,messages_count,tokens_total")
    .eq("tenant_id", tenantId)
    .order("period_start", { ascending: false })
    .limit(months);
  if (error) throw error;
  return (data as UsageRow[]) ?? [];
}
