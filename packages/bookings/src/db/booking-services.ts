import { getSupabase } from "./client";
import type { LocaleString } from "../types";

export async function upsertServiceFromSanity(args: {
  booking_tenant_id: string;
  sanity_document_id: string;
  name: LocaleString;
  description: LocaleString;
  duration_min: number;
  buffer_before_min: number;
  buffer_after_min: number;
  price_cents: number | null;
  currency: string;
  color: string | null;
  active: boolean;
  sort_order: number;
  source_revision: string | null;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("booking_services")
    .upsert(
      {
        booking_tenant_id: args.booking_tenant_id,
        sanity_document_id: args.sanity_document_id,
        name: args.name,
        description: args.description,
        duration_min: args.duration_min,
        buffer_before_min: args.buffer_before_min,
        buffer_after_min: args.buffer_after_min,
        price_cents: args.price_cents,
        currency: args.currency,
        color: args.color,
        active: args.active,
        sort_order: args.sort_order,
        source_revision: args.source_revision,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "booking_tenant_id,sanity_document_id" }
    );
  if (error) throw error;
}

export async function deleteService(args: {
  sanity_document_id: string;
}): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("booking_services")
    .delete()
    .eq("sanity_document_id", args.sanity_document_id);
  if (error) throw error;
}
