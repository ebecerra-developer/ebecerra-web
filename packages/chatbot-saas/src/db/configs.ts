import { getSupabase } from "./client";
import type { ChatbotConfig } from "../types";

export async function getConfig(tenantId: string): Promise<ChatbotConfig | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chatbot_configs_cache")
    .select("*")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) throw error;
  return data as ChatbotConfig | null;
}

export type UpsertConfigInput = Partial<Omit<ChatbotConfig, "tenant_id">> & {
  tenant_id: string;
  system_prompt: string;
};

export async function upsertConfig(input: UpsertConfigInput): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("chatbot_configs_cache")
    .upsert(
      {
        tenant_id: input.tenant_id,
        system_prompt: input.system_prompt,
        greeting: input.greeting ?? "Hola, ¿en qué puedo ayudarte?",
        tone: input.tone ?? "cordial",
        language: input.language ?? "es",
        business_info: input.business_info ?? {},
        faqs: input.faqs ?? [],
        primary_color: input.primary_color ?? "#047857",
        position: input.position ?? "bottom-right",
        avatar_url: input.avatar_url ?? null,
        bubble_label: input.bubble_label ?? null,
        model: input.model ?? "llama-3.1-70b-versatile",
        synced_at: new Date().toISOString(),
        source_revision: input.source_revision ?? null,
      },
      { onConflict: "tenant_id" }
    );

  if (error) throw error;
}
