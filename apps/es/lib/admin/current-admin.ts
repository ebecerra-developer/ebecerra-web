import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminRole = "owner" | "editor" | "client";

export interface AdminPermissions {
  chatbot?: boolean;
  bookings?: boolean;
  social?: boolean;
}

export interface CurrentAdmin {
  email: string;
  role: AdminRole;
  tenant_id: string | null;
  permissions: AdminPermissions;
  isOperator: boolean;
}

/**
 * Resuelve el admin actual (email + role + permissions). Redirige a /admin/login
 * si no hay sesión o no está en app_admins.
 *
 * Si `requirePermission` se pasa, también redirige si el flag está apagado para
 * un client (operator siempre pasa).
 */
export async function getCurrentAdmin(opts?: {
  requirePermission?: keyof AdminPermissions;
}): Promise<CurrentAdmin> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/admin/login");

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("app_admins")
    .select("email, role, tenant_id, permissions")
    .eq("email", user.email)
    .maybeSingle();
  if (error) throw error;
  if (!data) redirect("/admin/login");

  const role = data.role as AdminRole;
  const isOperator = role === "owner" || role === "editor";
  const permissions = (data.permissions as AdminPermissions) ?? {};

  if (opts?.requirePermission && !isOperator) {
    if (!permissions[opts.requirePermission]) {
      redirect("/admin");
    }
  }

  return {
    email: data.email as string,
    role,
    tenant_id: data.tenant_id as string | null,
    permissions,
    isOperator,
  };
}
