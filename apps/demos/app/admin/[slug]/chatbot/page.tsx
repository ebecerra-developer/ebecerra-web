import { AuthShell } from "../../_lib/AuthShell";
import { ChatbotSessions } from "./ChatbotSessions";
import { UsageWidget } from "./UsageWidget";

export const metadata = { title: "Chatbot · demos admin" };

export default async function ChatbotAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <AuthShell slug={slug} activeModule="chatbot">
      <h1 className="admin-page__title">Conversaciones del chatbot</h1>
      <p className="admin-page__lead">
        Aquí ves cada conversación del asistente con tus clientes y el
        consumo de tokens del mes.
      </p>

      <UsageWidget slug={slug} />

      <h2 className="admin-page__section-title">Sesiones recientes</h2>
      <ChatbotSessions slug={slug} />
    </AuthShell>
  );
}
