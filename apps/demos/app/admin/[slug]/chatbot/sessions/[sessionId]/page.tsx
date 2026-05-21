import Link from "next/link";
import { AuthShell } from "../../../../_lib/AuthShell";
import { SessionMessages } from "./SessionMessages";

export const metadata = { title: "Sesión · demos admin" };

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>;
}) {
  const { slug, sessionId } = await params;

  return (
    <AuthShell slug={slug} activeModule="chatbot">
      <nav className="admin-breadcrumb">
        <Link href={`/admin/${slug}/chatbot`}>← Sesiones</Link>
      </nav>

      <h1 className="admin-page__title">Conversación</h1>
      <p className="admin-page__lead">
        <code>{sessionId.slice(0, 12)}…</code>
      </p>

      <SessionMessages slug={slug} sessionId={sessionId} />
    </AuthShell>
  );
}
