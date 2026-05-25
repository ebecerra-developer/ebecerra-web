import { ModuleGrid } from "@ebecerra/client-admin-sdk/components";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import AdminShell from "./AdminShell";
import { modulesForUser } from "./_lib/modules";

export const dynamic = "force-dynamic";

export default async function AdminIndexPage() {
  const me = await getCurrentAdmin();
  const modules = modulesForUser({
    permissions: me.permissions,
    isOperator: me.isOperator,
  });

  return (
    <AdminShell
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <h1 className="admin-page__title">Panel</h1>
      <p className="admin-page__lead">
        Consola interna de ebecerra. Cada módulo es una sección independiente.
      </p>
      <h2 className="admin-page__section-title">Módulos disponibles</h2>
      <ModuleGrid modules={modules} />
    </AdminShell>
  );
}
