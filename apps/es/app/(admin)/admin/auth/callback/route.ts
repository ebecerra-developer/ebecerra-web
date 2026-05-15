import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Callback OAuth de Supabase.
 *
 * Flujo:
 * 1. El user vuelve aquí con `?code=...` desde Supabase tras autorizar en
 *    GitHub/Google.
 * 2. exchangeCodeForSession() canjea el code por una sesión y setea cookies.
 * 3. Comprobamos el email contra la whitelist `app_admins`.
 *    - Si está → redirect a /admin (chatbot por defecto).
 *    - Si NO → signOut() y redirect a /admin/login?error=unauthorized.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/admin/login?error=oauth", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[admin/auth/callback] exchange failed:", exchangeError);
    return NextResponse.redirect(new URL("/admin/login?error=oauth", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login?error=oauth", url.origin));
  }

  // Whitelist check. Cuando el usuario está autenticado, RLS le permite leer
  // su propia fila de app_admins (policy app_admins_self_read). Si no hay
  // fila, .single() falla y rechazamos.
  const { data: admin, error: lookupError } = await supabase
    .from("app_admins")
    .select("email, role")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (lookupError || !admin) {
    console.warn("[admin/auth/callback] unauthorized email:", user.email);
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/admin/login?error=unauthorized", url.origin)
    );
  }

  return NextResponse.redirect(new URL("/admin/chatbot", url.origin));
}
