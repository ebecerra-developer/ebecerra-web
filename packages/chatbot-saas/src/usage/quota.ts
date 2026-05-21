import { getCurrentUsage } from "../db/usage";
import type { Tenant } from "../types";

export class QuotaExceededError extends Error {
  constructor(
    public tenantId: string,
    public current: number,
    public limit: number
  ) {
    super(
      `Quota exceeded for tenant ${tenantId}: ${current}/${limit} messages this month`
    );
    this.name = "QuotaExceededError";
  }
}

export type QuotaStatus = {
  ok: boolean;
  current: number;
  limit: number;
  resetAt: string; // ISO date — primer día del mes siguiente
};

function firstOfNextMonth(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Comprueba si el tenant puede enviar otro mensaje este mes.
 * Devuelve estado; el caller decide qué hacer (loggear + 429, etc.).
 */
export async function checkQuota(tenant: Tenant): Promise<QuotaStatus> {
  const usage = await getCurrentUsage(tenant.id);
  return {
    ok: usage.messages_count < tenant.monthly_message_limit,
    current: usage.messages_count,
    limit: tenant.monthly_message_limit,
    resetAt: firstOfNextMonth(),
  };
}

/**
 * Variante que lanza si excede — útil cuando quieres flow corto.
 */
export async function assertQuota(tenant: Tenant): Promise<void> {
  const status = await checkQuota(tenant);
  if (!status.ok) {
    throw new QuotaExceededError(tenant.id, status.current, status.limit);
  }
}
