"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Verifica que la request viene de un admin autenticado en la whitelist.
 * Lanza si no es válido.
 */
async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");
  const { data: admin } = await supabase
    .from("app_admins")
    .select("email")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  if (!admin) throw new Error("Not an admin");
  return user;
}

export async function approveCommentAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("invalid id");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("post_comments")
    .update({ status: "approved", approved_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/comments");
}

export async function rejectCommentAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("invalid id");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("post_comments")
    .update({ status: "rejected", approved_at: null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/comments");
}

export async function deleteCommentAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("invalid id");
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("post_comments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/comments");
}
