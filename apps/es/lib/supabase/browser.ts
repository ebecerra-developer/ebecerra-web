import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para Client Components. Singleton implícito por ámbito de
 * módulo: createBrowserClient mantiene su propia caché de sesión en el browser.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)"
    );
  }
  return createBrowserClient(url, anon);
}
