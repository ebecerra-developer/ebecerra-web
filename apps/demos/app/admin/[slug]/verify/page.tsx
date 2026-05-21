import { VerifyHandler } from "@ebecerra/client-admin-sdk/client";
import { notFound } from "next/navigation";
import { DEMO_TEMPLATE, resolveTenantKey } from "../../_lib/tenant";

export const metadata = { title: "Verificando · demos admin" };

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();

  return (
    <div className="admin-shell" data-template={DEMO_TEMPLATE[slug] ?? "fisio"}>
      <VerifyHandler
        apiPath={`/admin/${slug}/api/auth/verify`}
        redirectTo={`/admin/${slug}`}
      />
    </div>
  );
}
