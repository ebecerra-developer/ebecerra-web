import { findTenantsBySanityDoc } from "../db/tenants";
import { upsertConfig } from "../db/configs";
import { logAudit } from "../db/audit";
import type { ChatbotConfig } from "../types";

/**
 * Payload típico de un webhook de Sanity. La forma exacta depende de cómo
 * configures el webhook (campos proyectados), pero asumimos doc completo.
 *
 * Para Sanity webhook config sugerido:
 *   Filter:    `_type in ["profile","demoSite","chatbotConfig"]`
 *   Projection: completo (`_id`, `_type`, `_rev`, ...resto del documento)
 *   Trigger:   On publish
 *   HTTP:      POST a https://chats.ebecerra.es/api/saas/sync-config
 *   Auth:      Signed with secret = SANITY_WEBHOOK_SECRET
 */
type SanityWebhookPayload = {
  _id: string;
  _type: string;
  _rev?: string;
  // Proyecto de Sanity de donde viene (lo añadimos via webhook query string,
  // ya que Sanity no incluye projectId en el body por defecto).
  // El consumidor del handler debe pasar projectId explícitamente.
  [key: string]: unknown;
};

export type SyncResult =
  | { ok: true; tenantIds: string[]; action: "synced" }
  | { ok: false; reason: string };

/**
 * Procesa un webhook de Sanity. Mapea el doc a uno o más tenants y actualiza
 * el cache de cada uno. Un mismo documento puede afectar a varios tenants
 * (apps-es y apps-tech comparten `profile`).
 */
export async function handleSyncWebhook(args: {
  sanityProjectId: string;
  payload: SanityWebhookPayload;
}): Promise<SyncResult> {
  const { payload, sanityProjectId } = args;

  const tenants = await findTenantsBySanityDoc({
    sanityProjectId,
    documentId: payload._id,
    documentType: payload._type,
  });
  if (tenants.length === 0) {
    return {
      ok: false,
      reason: `No tenants matched sanity_project_id=${sanityProjectId} _id=${payload._id} _type=${payload._type}`,
    };
  }

  // Cada tenant decide qué subcampo del doc consume vía sanity_field_path:
  //  - chatbotConfig standalone → NULL (config en root)
  //  - profile → 'chatbot' (apps-es) o 'chatbotTech' (apps-tech)
  //  - demoSite → 'chatbot' (apps-demos)
  // Mismo doc puede alimentar a varios tenants leyendo subcampos distintos.
  const syncedTenantIds: string[] = [];
  const skipped: Array<{ tenantId: string; reason: string }> = [];

  for (const tenant of tenants) {
    const fieldPath = tenant.sanity_field_path;
    const rawConfig =
      fieldPath === null || fieldPath === ""
        ? (payload as Record<string, unknown>)
        : (payload as Record<string, unknown>)[fieldPath];

    if (!rawConfig || typeof rawConfig !== "object") {
      skipped.push({
        tenantId: tenant.id,
        reason: `No config at path "${fieldPath ?? "(root)"}" in doc ${payload._id}`,
      });
      continue;
    }

    const mapped = mapSanityToConfig(rawConfig as Record<string, unknown>);
    if (!mapped.system_prompt) {
      skipped.push({
        tenantId: tenant.id,
        reason: `Empty systemPrompt at path "${fieldPath ?? "(root)"}"`,
      });
      continue;
    }

    await upsertConfig({
      tenant_id: tenant.id,
      system_prompt: mapped.system_prompt,
      greeting: mapped.greeting,
      tone: mapped.tone,
      language: mapped.language,
      business_info: mapped.business_info,
      faqs: mapped.faqs,
      primary_color: mapped.primary_color,
      position: mapped.position,
      avatar_url: mapped.avatar_url,
      bubble_label: mapped.bubble_label,
      model: mapped.model,
      source_revision: payload._rev ?? null,
    });

    await logAudit({
      tenant_id: tenant.id,
      action: "config.synced",
      details: {
        sanity_doc_id: payload._id,
        sanity_field_path: fieldPath,
        rev: payload._rev,
      },
    });

    syncedTenantIds.push(tenant.id);
  }

  if (syncedTenantIds.length === 0) {
    return {
      ok: false,
      reason: `No tenant successfully synced. Skipped: ${JSON.stringify(skipped)}`,
    };
  }

  return { ok: true, tenantIds: syncedTenantIds, action: "synced" };
}

/**
 * Mapea la estructura del doc Sanity (localeString/localeText, campos opcionales)
 * a la forma plana de chatbot_configs_cache.
 *
 * Convierte localeString/localeText { es, en } al campo del idioma principal del tenant.
 * Si no hay idioma especificado, default a 'es'.
 */
function mapSanityToConfig(
  raw: Record<string, unknown>
): Partial<ChatbotConfig> & { system_prompt: string } {
  const language = (raw.language as ChatbotConfig["language"]) ?? "es";

  // Helpers de localización
  const pickLocale = (v: unknown): string => {
    if (typeof v === "string") return v;
    if (v && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const val = obj[language] ?? obj["es"] ?? obj["en"];
      return typeof val === "string" ? val : "";
    }
    return "";
  };

  // SystemPrompt: en schema viejo (chatbot embebido) es `systemPrompt` localeText.
  //              en schema nuevo (chatbotConfig) es `systemPrompt` localeText.
  const system_prompt =
    pickLocale(raw["systemPrompt"]) || pickLocale(raw["system_prompt"]) || "";

  const greeting =
    pickLocale(raw["greeting"]) || "Hola, ¿en qué puedo ayudarte?";

  // tone existe solo en chatbotConfig (no en schema viejo). Default cordial.
  const tone = (raw["tone"] as ChatbotConfig["tone"]) ?? "cordial";

  // businessInfo nested object (solo schema nuevo)
  const businessInfoRaw = (raw["businessInfo"] as Record<string, unknown>) ?? {};
  const business_info: ChatbotConfig["business_info"] = {
    name: (businessInfoRaw.name as string) || undefined,
    description: pickLocale(businessInfoRaw.description) || undefined,
    address: (businessInfoRaw.address as string) || undefined,
    hours: (businessInfoRaw.hours as string) || undefined,
    services: pickLocale(businessInfoRaw.services) || undefined,
    contactWhatsapp: (businessInfoRaw.contactWhatsapp as string) || undefined,
    contactEmail: (businessInfoRaw.contactEmail as string) || undefined,
  };

  // faqs array (solo schema nuevo)
  const faqsRaw = (raw["faqs"] as Array<Record<string, unknown>>) ?? [];
  const faqs: ChatbotConfig["faqs"] = faqsRaw.map((f) => ({
    question: pickLocale(f.question),
    answer: pickLocale(f.answer),
    tags: Array.isArray(f.tags) ? (f.tags as string[]) : undefined,
  }));

  // branding (solo schema nuevo)
  const brandingRaw = (raw["branding"] as Record<string, unknown>) ?? {};
  const primary_color = (brandingRaw.primaryColor as string) ?? "#047857";
  const position =
    (brandingRaw.position as ChatbotConfig["position"]) ?? "bottom-right";
  const bubble_label =
    pickLocale(brandingRaw.bubbleLabel) ||
    pickLocale(raw["label"]) || // schema viejo: chatbot.label
    null;

  // Avatar URL: schema viejo no lo tiene. Schema nuevo lo tiene en branding.avatar (image).
  // No resolvemos la image aquí — guardamos null y se resuelve cuando se construye el widget UI.
  const avatar_url = null;

  const model =
    (raw["model"] as string) ?? "llama-3.1-70b-versatile";

  return {
    system_prompt,
    greeting,
    tone,
    language,
    business_info,
    faqs,
    primary_color,
    position,
    avatar_url,
    bubble_label,
    model,
  };
}
