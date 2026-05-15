import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso en Server Components, Route Handlers y Server Actions.
 *
 * Lee/escribe la sesión desde las cookies de la request actual. Cualquier
 * llamada `auth.getUser()` valida el token contra Supabase Auth — NO confiar
 * en `getSession()` en server, que no revalida.
 *
 * Las env vars deben estar definidas. Si no, lanza error temprano (mejor que
 * permitir un cliente "fantasma" que devuelve null silenciosamente).
 */
export async function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)"
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Llamado desde un Server Component (read-only). El refresh se hará
          // en el siguiente request vía middleware. Ignorar es correcto.
        }
      },
    },
  });
}
