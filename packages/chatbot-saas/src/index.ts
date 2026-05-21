/**
 * @ebecerra/chatbot-saas
 *
 * Lógica server-side compartida del sistema chatbot multi-tenant:
 * - Auth (tenant keys server-to-server)
 * - Config resolution (Sanity webhook → Supabase cache)
 * - Chat orchestration (auth + quota + Groq streaming + persist)
 * - Usage tracking
 * - Audit log
 *
 * Consumido por apps/es API routes (/api/v1/chat, /api/saas/sync-config, etc.).
 */

export * from "./types";
export * as auth from "./auth";
export * as config from "./config";
export * as chat from "./chat";
export * as usage from "./usage";
export * as sanitySync from "./sanity-sync";
export * as db from "./db";
