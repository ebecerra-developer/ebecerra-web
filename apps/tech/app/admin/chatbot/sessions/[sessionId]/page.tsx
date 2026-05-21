import Link from "next/link";
import { requireSession } from "@ebecerra/client-admin-sdk/server";
import { LogoutButton } from "@ebecerra/client-admin-sdk/client";
import { SessionMessages } from "./SessionMessages";

export const metadata = { title: "Session · ebecerra.tech admin" };

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  await requireSession();
  const { sessionId } = await params;

  return (
    <div className="admin-page">
      <nav className="admin-breadcrumb">
        <Link href="/admin/chatbot">← sessions</Link>
      </nav>

      <header className="admin-page__header">
        <div>
          <h1>// session</h1>
          <p className="admin-page__subtitle">
            <code>{sessionId.slice(0, 12)}…</code>
          </p>
        </div>
        <LogoutButton className="admin-logout" />
      </header>

      <SessionMessages sessionId={sessionId} />
    </div>
  );
}
