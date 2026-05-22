import { getSupabase } from "./client";

export async function logAudit(args: {
  booking_tenant_id?: string | null;
  booking_id?: string | null;
  actor_email?: string | null;
  action: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("booking_audit_log").insert({
    booking_tenant_id: args.booking_tenant_id ?? null,
    booking_id: args.booking_id ?? null,
    actor_email: args.actor_email ?? null,
    action: args.action,
    details: args.details ?? null,
  });
  if (error) throw error;
}
