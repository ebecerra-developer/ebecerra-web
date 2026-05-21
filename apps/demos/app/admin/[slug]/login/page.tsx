import { LoginForm } from "@ebecerra/client-admin-sdk/client";
import { DEMO_DISPLAY_NAME, resolveTenantKey } from "../../_lib/tenant";
import { notFound } from "next/navigation";

export const metadata = { title: "Acceso · demos admin" };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();

  return (
    <LoginForm
      tenantName={DEMO_DISPLAY_NAME[slug] ?? slug}
      apiPath={`/admin/${slug}/api/auth/login`}
    />
  );
}
