import { requireSession } from "@ebecerra/client-admin-sdk/server";
import { LogoutButton } from "@ebecerra/client-admin-sdk/client";
import { ChatbotSessions } from "./ChatbotSessions";
import { UsageWidget } from "./UsageWidget";

export const metadata = { title: "Conversaciones · ebecerra.tech admin" };

export default async function ChatbotAdminPage() {
  const session = await requireSession();

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>// ebecerra.tech · chatbot</h1>
          <p className="admin-page__subtitle">$ session: {session.email}</p>
        </div>
        <LogoutButton className="admin-logout" />
      </header>

      <UsageWidget />

      <h2 className="admin-page__section-title">Recent sessions</h2>
      <ChatbotSessions />
    </div>
  );
}
