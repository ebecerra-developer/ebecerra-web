import { ModuleGrid } from "@ebecerra/client-admin-sdk/components";
import { AuthShell } from "../_lib/AuthShell";
import { modulesForSlug } from "../_lib/modules";
import { DEMO_DISPLAY_NAME } from "../_lib/tenant";

export const metadata = { title: "Inicio · demos admin" };

export default async function SlugIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const display = DEMO_DISPLAY_NAME[slug] ?? slug;

  return (
    <AuthShell slug={slug}>
      <h1 className="admin-page__title">Panel de {display}</h1>
      <p className="admin-page__lead">
        Bienvenida. Aquí puedes ver el detalle de cada módulo del admin.
      </p>
      <h2 className="admin-page__section-title">Módulos disponibles</h2>
      <ModuleGrid modules={modulesForSlug(slug)} />
    </AuthShell>
  );
}
