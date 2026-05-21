import { ModuleGrid } from "@ebecerra/client-admin-sdk/components";
import { AuthShell } from "./_lib/AuthShell";
import { MODULES } from "./_lib/modules";

export const metadata = { title: "Inicio · ebecerra.tech admin" };

export default async function AdminIndexPage() {
  return (
    <AuthShell>
      <h1 className="admin-page__title">// panel</h1>
      <p className="admin-page__lead">
        Panel interno de ebecerra.tech. Cada módulo es una sección
        independiente — añadir más es solo registrar una entrada en{" "}
        <code>_lib/modules.ts</code>.
      </p>
      <h2 className="admin-page__section-title">Módulos disponibles</h2>
      <ModuleGrid modules={MODULES} />
    </AuthShell>
  );
}
