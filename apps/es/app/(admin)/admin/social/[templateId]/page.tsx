import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin/current-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTemplate } from "@/lib/social/templates";
import AdminShell from "../../AdminShell";
import TemplateForm from "./TemplateForm";

export const dynamic = "force-dynamic";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const me = await getCurrentAdmin({ requirePermission: "social" });
  const { templateId } = await params;
  const template = await getTemplate(templateId);
  if (!template) notFound();

  // Solo el operator puede elegir tenant. Clients renderizan siempre dentro de su tenant.
  let tenants: { id: string; name: string; slug: string }[] = [];
  if (me.isOperator) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("tenants")
      .select("id, name, slug")
      .order("name");
    tenants = data ?? [];
  }

  return (
    <AdminShell
      activeSection="social"
      userEmail={me.email}
      permissions={me.permissions}
      isOperator={me.isOperator}
    >
      <div style={{ marginBottom: 24 }}>
        <a
          href="/admin/social"
          style={{ fontSize: 13, color: "#a8a29e", textDecoration: "none" }}
        >
          ← Plantillas
        </a>
      </div>
      <h2 style={{ marginBottom: 4 }}>{template.name}</h2>
      <p style={{ color: "#a8a29e", marginBottom: 24, fontSize: 14 }}>
        {template.description}
      </p>
      <div
        style={{
          fontSize: 12,
          color: "#a8a29e",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 24,
        }}
      >
        {template.format} · {template.width}×{template.height}
      </div>
      <TemplateForm
        template={template}
        tenants={tenants}
        isOperator={me.isOperator}
      />
    </AdminShell>
  );
}
