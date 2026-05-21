import { AuthShell } from "../_lib/AuthShell";
import { ChatbotSessions } from "./ChatbotSessions";
import { UsageWidget } from "./UsageWidget";

export const metadata = { title: "Chatbot · ebecerra.tech admin" };

export default async function ChatbotAdminPage() {
  return (
    <AuthShell activeModule="chatbot">
      <h1 className="admin-page__title">// chatbot</h1>
      <p className="admin-page__lead">
        Conversaciones del asistente con visitantes y consumo del mes.
      </p>

      <UsageWidget />

      <h2 className="admin-page__section-title">Sesiones recientes</h2>
      <ChatbotSessions />
    </AuthShell>
  );
}
