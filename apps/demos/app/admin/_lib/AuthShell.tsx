import { redirect } from "next/navigation";
import { readSession } from "@ebecerra/client-admin-sdk/server";
import { AdminLayout } from "@ebecerra/client-admin-sdk/components";
import { ADMIN_VERSION, brandForSlug, modulesForSlug } from "./modules";
import { DEMO_TEMPLATE } from "./tenant";

/**
 * Wrapper para páginas autenticadas del admin multi-tenant de apps/demos.
 * Redirige a /admin/<slug>/login si no hay sesión, monta el AdminLayout
 * con la marca y módulos del slug.
 *
 * El layout exterior (data-template via [slug]/layout.tsx) ya envuelve esto
 * con .admin-shell, pero como AdminLayout también renderiza .admin-shell
 * para que las páginas no autenticadas (/login, /verify) lo tengan, aquí
 * hay un shell nested — el outer queda sin estilos visibles (solo provee
 * data-template); el inner del AdminLayout es el que pinta.
 *
 * Para evitar shell nested, /admin/[slug]/layout.tsx solo provee el
 * data-template como atributo en un fragment-equivalent. Ver detalle abajo.
 */
export async function AuthShell({
  slug,
  activeModule,
  children,
}: {
  slug: string;
  activeModule?: string;
  children: React.ReactNode;
}) {
  const session = await readSession();
  if (!session) {
    redirect(`/admin/${slug}/login` as Parameters<typeof redirect>[0]);
  }

  return (
    <AdminLayout
      brand={brandForSlug(slug)}
      modules={modulesForSlug(slug)}
      session={session!}
      activeModule={activeModule}
      version={ADMIN_VERSION}
      loginPath={`/admin/${slug}/login`}
      logoutApiPath={`/admin/${slug}/api/auth/logout`}
      templateAttr={DEMO_TEMPLATE[slug] ?? "fisio"}
    >
      {children}
    </AdminLayout>
  );
}
