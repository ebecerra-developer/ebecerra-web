import type { AdminBrand, AdminModule, SessionPayload } from "../types";
import { AdminHeader } from "./AdminHeader";
import { AdminSubNav } from "./AdminSubNav";
import { AdminFooter } from "./AdminFooter";

export type AdminLayoutProps = {
  brand: AdminBrand;
  modules: AdminModule[];
  session: Pick<SessionPayload, "email" | "role">;
  /** Key del módulo activo (para resaltar en sub-nav). */
  activeModule?: string;
  /** Path del logout API (se pasa al UserMenu). Default /api/auth/logout. */
  logoutApiPath?: string;
  /** Path al que redirigir tras logout. Default /admin/login. */
  loginPath?: string;
  /** Versión/build a mostrar en el footer. Default vacío. */
  version?: string;
  /**
   * Valor de `data-template` para el shell raíz. Usado para activar
   * variantes de paleta en brand-bridge.css (multi-tenant).
   */
  templateAttr?: string;
  children: React.ReactNode;
};

/**
 * Layout completo del admin: header sticky + sub-nav de módulos + main + footer.
 *
 * Server Component — recibe `session` ya resuelta (idealmente vía
 * `requireSession()` en la page que envuelve los hijos).
 *
 * Los tokens visuales viven en CSS custom properties (--admin-*). Cada
 * cliente sobreescribe esas vars en un brand-bridge.css que mapea sus
 * tokens de marca → tokens del admin.
 */
export function AdminLayout({
  brand,
  modules,
  session,
  activeModule,
  logoutApiPath,
  loginPath,
  version,
  templateAttr,
  children,
}: AdminLayoutProps) {
  return (
    <div className="admin-shell" data-template={templateAttr}>
      <AdminHeader
        brand={brand}
        session={session}
        logoutApiPath={logoutApiPath}
        loginPath={loginPath}
      />
      {modules.length > 0 && (
        <AdminSubNav modules={modules} activeKey={activeModule} />
      )}
      <main className="admin-main">{children}</main>
      <AdminFooter brand={brand} version={version} />
    </div>
  );
}
