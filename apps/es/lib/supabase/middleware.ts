import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca cookies de sesión Supabase en cada request del middleware.
 * Devuelve `{ response, user }`:
 *   - `response`: NextResponse con cookies actualizadas (úsalo o copia sus
 *     cookies a tu propia response).
 *   - `user`: el usuario autenticado (o null). NUNCA confiar en getSession()
 *     desde el middleware — el token puede estar caducado y getUser revalida.
 *
 * Si las env vars no están, devuelve `{ response: NextResponse.next(), user: null }`
 * sin tocar nada — modo "auth deshabilitado".
 */
export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) {
    return { response: NextResponse.next({ request }), user: null };
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
