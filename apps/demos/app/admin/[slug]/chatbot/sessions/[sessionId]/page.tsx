import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { readSession } from "@ebecerra/client-admin-sdk/server";
import { LogoutButton } from "@ebecerra/client-admin-sdk/client";
import { resolveTenantKey } from "../../../../_lib/tenant";
import { SessionMessages } from "./SessionMessages";

export const metadata = { title: "Conversación · demos admin" };

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>;
}) {
  const { slug, sessionId } = await params;
  if (!resolveTenantKey(slug)) notFound();

  const session = await readSession();
  if (!session) {
    redirect(`/admin/${slug}/login` as Parameters<typeof redirect>[0]);
  }

  return (
    <div className="admin-page">
      <nav className="admin-breadcrumb">
        <Link href={`/admin/${slug}/chatbot`}>← Sesiones</Link>
      </nav>

      <header className="admin-page__header">
        <div>
          <h1>Conversación</h1>
          <p className="admin-page__subtitle">
            <code>{sessionId.slice(0, 12)}…</code>
          </p>
        </div>
        <LogoutButton
          className="admin-logout"
          apiPath={`/admin/${slug}/api/auth/logout`}
          redirectTo={`/admin/${slug}/login`}
        />
      </header>

      <SessionMessages slug={slug} sessionId={sessionId} />
    </div>
  );
}
