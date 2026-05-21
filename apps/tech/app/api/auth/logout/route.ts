import { buildLogoutHandler } from "@ebecerra/client-admin-sdk/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = buildLogoutHandler();
