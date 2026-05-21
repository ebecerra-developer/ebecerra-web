/**
 * Slug → tenant key mapping para los admin paneles multi-tenant de apps/demos.
 *
 * Cada demo (equilibrio, marta-solana, claudia-entrena, eco) tiene su tenant key
 * propia en env vars. Esto permite que `/admin/<slug>/...` consulte solo las
 * conversaciones de ese tenant en el backend SaaS (admin.ebecerra.es).
 */
export const TENANT_KEY_BY_DEMO: Record<string, string | undefined> = {
  equilibrio: process.env.CHATBOT_TENANT_KEY_EQUILIBRIO,
  "marta-solana": process.env.CHATBOT_TENANT_KEY_MARTA_SOLANA,
  "claudia-entrena": process.env.CHATBOT_TENANT_KEY_CLAUDIA_ENTRENA,
  eco: process.env.CHATBOT_TENANT_KEY_ECO,
};

/**
 * Nombre legible para mostrar en el header del admin.
 */
export const DEMO_DISPLAY_NAME: Record<string, string> = {
  equilibrio: "Equilibrio",
  "marta-solana": "Marta Solana",
  "claudia-entrena": "Claudia Entrena",
  eco: "Eco",
};

/**
 * Template visual de cada demo (se usa como `data-template` en el layout
 * para activar tokens scopeados de packages/tokens/demos-*.css).
 */
export const DEMO_TEMPLATE: Record<string, string> = {
  equilibrio: "fisio",
  "marta-solana": "coach-editorial",
  "claudia-entrena": "coach-vibrant",
  eco: "tandem",
};

export function resolveTenantKey(slug: string): string | null {
  return TENANT_KEY_BY_DEMO[slug] ?? null;
}
