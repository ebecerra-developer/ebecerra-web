import { getConfig } from "../db/configs";
import type { ChatbotConfig, Tenant } from "../types";

export class ConfigNotFoundError extends Error {
  constructor(public tenantId: string) {
    super(`Config not found for tenant ${tenantId}`);
    this.name = "ConfigNotFoundError";
  }
}

/**
 * Resuelve la config activa de un tenant. Lee siempre del cache (Supabase).
 * El cache se mantiene via webhook Sanity → /api/saas/sync-config.
 *
 * Polimorfismo por config_source:
 *  - 'sanity_proxy'      → cache poblado por webhook (V1)
 *  - 'central_supabase'  → cache es la fuente directa (V2 — cliente sin Sanity)
 *  - 'inline'            → not implemented (legacy)
 *
 * En V1 ambos casos relevantes leen del mismo cache. Lo único que cambia es
 * quién lo escribe — webhook o admin UI.
 */
export async function resolveConfig(tenant: Tenant): Promise<ChatbotConfig> {
  if (tenant.config_source === "inline") {
    throw new Error(
      `Tenant ${tenant.slug} uses config_source=inline which is not supported in V1`
    );
  }
  const config = await getConfig(tenant.id);
  if (!config) throw new ConfigNotFoundError(tenant.id);
  return config;
}
