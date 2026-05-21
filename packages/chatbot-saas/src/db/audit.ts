import { getSupabase } from "./client";
import type { AuditEntry } from "../types";

export async function logAudit(entry: AuditEntry): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("chatbot_audit_log").insert({
    tenant_id: entry.tenant_id,
    actor_email: entry.actor_email ?? null,
    action: entry.action,
    details: entry.details ?? null,
  });

  // Audit log nunca debe romper el flujo principal. Log y sigue.
  if (error) {
    console.error("[chatbot-saas] audit log failed:", error);
  }
}
