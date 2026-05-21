import Link from "next/link";
import { AuthShell } from "../../../_lib/AuthShell";
import { SessionMessages } from "./SessionMessages";

export const metadata = { title: "Sesión · ebecerra.tech admin" };

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <AuthShell activeModule="chatbot">
      <nav className="admin-breadcrumb">
        <Link href="/admin/chatbot">← sessions</Link>
      </nav>

      <h1 className="admin-page__title">// session</h1>
      <p className="admin-page__lead">
        <code>{sessionId.slice(0, 12)}…</code>
      </p>

      <SessionMessages sessionId={sessionId} />
    </AuthShell>
  );
}
