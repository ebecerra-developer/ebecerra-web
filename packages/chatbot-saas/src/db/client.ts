import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Cliente Supabase con secret key (antes "service_role"). Bypasea RLS.
 * Único punto de creación — todo el package usa este singleton.
 *
 * Requiere envs (convención existente en apps/es):
 *   - NEXT_PUBLIC_SUPABASE_URL (URL del proyecto)
 *   - SUPABASE_SECRET_KEY (secret key — NUNCA exponer al cliente, marcar Sensitive en Vercel)
 */
export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase config: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set"
    );
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
