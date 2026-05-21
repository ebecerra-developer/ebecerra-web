import { notFound } from "next/navigation";
import { DEMO_TEMPLATE, resolveTenantKey } from "../_lib/tenant";

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

  const template = DEMO_TEMPLATE[slug] ?? "default";

  return (
    <div className="admin-shell" data-template={template} data-slug={slug}>
      {children}
    </div>
  );
}
