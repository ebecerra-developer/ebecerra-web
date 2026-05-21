import { VerifyHandler } from "@ebecerra/client-admin-sdk/client";
import { resolveTenantKey } from "../../_lib/tenant";
import { notFound } from "next/navigation";

export const metadata = { title: "Verificando · demos admin" };

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();

  return (
    <VerifyHandler
      apiPath={`/admin/${slug}/api/auth/verify`}
      redirectTo={`/admin/${slug}/chatbot`}
    />
  );
}
