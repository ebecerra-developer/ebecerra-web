import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase con SECRET KEY — bypasea RLS.
 *
 * Usar SOLO desde server actions / route handlers del admin, después de haber
 * verificado sesión + whitelist con createSupabaseServerClient. Nunca exponer
 * a Client Components ni al browser.
 *
 * No mantiene sesión (auth: { persistSession: false }) — es service-role puro.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)"
    );
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
