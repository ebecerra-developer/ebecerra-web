import { notFound } from "next/navigation";
import { resolveTenantKey } from "../_lib/tenant";

export const dynamic = "force-dynamic";

export default async function SlugAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();
  return <>{children}</>;
}
