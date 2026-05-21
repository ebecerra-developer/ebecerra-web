import { requireSession } from "@ebecerra/client-admin-sdk/server";
import { AdminLayout } from "@ebecerra/client-admin-sdk/components";
import { ADMIN_VERSION, BRAND, MODULES } from "./modules";

export async function AuthShell({
  activeModule,
  children,
}: {
  activeModule?: string;
  children: React.ReactNode;
}) {
  const session = await requireSession();
  return (
    <AdminLayout
      brand={BRAND}
      modules={MODULES}
      session={session}
      activeModule={activeModule}
      version={ADMIN_VERSION}
    >
      {children}
    </AdminLayout>
  );
}
