import { LoginForm } from "@ebecerra/client-admin-sdk/client";
import { notFound } from "next/navigation";
import { DEMO_DISPLAY_NAME, DEMO_TEMPLATE, resolveTenantKey } from "../../_lib/tenant";

export const metadata = { title: "Acceso · demos admin" };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();

  return (
    <div className="admin-shell" data-template={DEMO_TEMPLATE[slug] ?? "fisio"}>
      <LoginForm
        tenantName={DEMO_DISPLAY_NAME[slug] ?? slug}
        apiPath={`/admin/${slug}/api/auth/login`}
      />
    </div>
  );
}
