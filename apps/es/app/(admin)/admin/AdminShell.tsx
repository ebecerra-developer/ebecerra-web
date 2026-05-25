import type { ReactNode } from "react";
import { AdminLayout } from "@ebecerra/client-admin-sdk/components";
import {
  ADMIN_VERSION,
  BRAND,
  modulesForUser,
  type ModulePermissions,
} from "./_lib/modules";

type AdminShellProps = {
  children: ReactNode;
  /** Identifica la sección activa para resaltar el link en la nav. */
  activeSection?: "chatbot" | "comments" | "bookings" | "social";
  userEmail: string;
  /** Flags por módulo del current user. Operators (role owner/editor) ven todo. */
  permissions?: ModulePermissions;
  /** Si true, ignora permissions y muestra todas las pestañas. */
  isOperator?: boolean;
};

export default function AdminShell({
  children,
  activeSection,
  userEmail,
  permissions,
  isOperator,
}: AdminShellProps) {
  const modules = modulesForUser({ permissions, isOperator });
  const role = isOperator ? "owner" : "client";

  return (
    <AdminLayout
      brand={BRAND}
      modules={modules}
      session={{ email: userEmail, role }}
      activeModule={activeSection}
      version={ADMIN_VERSION}
      logoutApiPath="/api/admin/logout"
      loginPath="/admin/login"
    >
      {children}
    </AdminLayout>
  );
}
