import { getSupabase } from "./client";
import type { Tenant, TenantStatus, ConfigSource } from "../types";

/**
 * Lookup tenant por hash del key (auth principal en V1).
 */
export async function findTenantByKeyHash(keyHash: string): Promise<Tenant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("tenant_key_hash", keyHash)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data as Tenant | null;
}

/**
 * Lookup tenant por id (admin).
 */
export async function findTenantById(id: string): Promise<Tenant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Tenant | null;
}

/**
 * Lookup tenants que matcheen el documento publicado.
 *
 * Dos formas de match:
 *  - sanity_match_type = 'document_id' → match exacto en _id
 *  - sanity_match_type = 'document_type' → match en _type (cubre N docs del mismo tipo, ej. apps-demos)
 *
 * Devuelve array porque un mismo doc puede afectar a varios tenants
 * (apps-es y apps-tech comparten profile).
 */
export async function findTenantsBySanityDoc(args: {
  sanityProjectId: string;
  documentId: string;
  documentType: string;
}): Promise<Tenant[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("sanity_project_id", args.sanityProjectId)
    .eq("status", "active")
    .or(
      `and(sanity_match_type.eq.document_id,sanity_document_id.eq.${args.documentId}),and(sanity_match_type.eq.document_type,sanity_document_id.eq.${args.documentType})`
    );

  if (error) throw error;
  return (data as Tenant[]) ?? [];
}

/**
 * Cuando un demoSite publica, todos los tenants apuntando a "demoSite" como id
 * son candidatos. En la práctica para apps-demos queremos UNO específico por
 * cada demoSite individual. Lookup alternativo por prefijo del id.
 */
export async function findTenantsBySanityProject(
  sanityProjectId: string
): Promise<Tenant[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("sanity_project_id", sanityProjectId)
    .eq("status", "active");
  if (error) throw error;
  return (data as Tenant[]) ?? [];
}

export async function listTenants(): Promise<Tenant[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Tenant[]) ?? [];
}

export type CreateTenantInput = {
  slug: string;
  name: string;
  config_source?: ConfigSource;
  sanity_project_id?: string;
  sanity_dataset?: string;
  sanity_workspace?: string;
  sanity_document_id?: string;
  tenant_key_hash: string;
  tenant_key_prefix: string;
  monthly_message_limit?: number;
};

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .insert({
      slug: input.slug,
      name: input.name,
      config_source: input.config_source ?? "sanity_proxy",
      sanity_project_id: input.sanity_project_id ?? null,
      sanity_dataset: input.sanity_dataset ?? null,
      sanity_workspace: input.sanity_workspace ?? null,
      sanity_document_id: input.sanity_document_id ?? null,
      tenant_key_hash: input.tenant_key_hash,
      tenant_key_prefix: input.tenant_key_prefix,
      monthly_message_limit: input.monthly_message_limit ?? 5000,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Tenant;
}

export async function updateTenantStatus(
  id: string,
  status: TenantStatus
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tenants")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function rotateTenantKey(
  id: string,
  keyHash: string,
  keyPrefix: string
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("tenants")
    .update({ tenant_key_hash: keyHash, tenant_key_prefix: keyPrefix })
    .eq("id", id);

  if (error) throw error;
}
