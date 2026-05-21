import { buildAdminProxyHandler } from "@ebecerra/client-admin-sdk/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = buildAdminProxyHandler("/api/admin/chatbot/usage");
