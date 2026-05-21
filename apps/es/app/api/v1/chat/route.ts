import { handleChatRequest } from "@ebecerra/chatbot-saas/chat";

/**
 * POST /api/v1/chat
 *
 * Endpoint principal del chatbot multi-tenant. Auth vía header X-Tenant-Key.
 * Devuelve SSE stream con la respuesta del modelo.
 *
 * Llamado desde:
 *  - Server-side proxy de cada web cliente (apps/es, apps/tech, apps/demos, llaullau, futuros)
 *  - V2: widget público con X-Api-Key
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleChatRequest(request);
}
