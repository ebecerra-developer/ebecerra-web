import { buildLogoutHandler } from "@ebecerra/client-admin-sdk/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const handler = buildLogoutHandler({ cookiePath: `/admin/${slug}` });
  return handler();
}
