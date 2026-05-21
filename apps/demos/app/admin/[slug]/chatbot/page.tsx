import { requireSession } from "@ebecerra/client-admin-sdk/server";
import { LogoutButton } from "@ebecerra/client-admin-sdk/client";
import { notFound, redirect } from "next/navigation";
import { DEMO_DISPLAY_NAME, resolveTenantKey } from "../../_lib/tenant";
import { ChatbotSessions } from "./ChatbotSessions";
import { UsageWidget } from "./UsageWidget";

export const metadata = { title: "Conversaciones · demos admin" };

export default async function ChatbotAdminPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!resolveTenantKey(slug)) notFound();

  // requireSession redirige a /admin/login si no hay sesión — sobrescribimos
  // con el path correcto por slug.
  const { readSession } = await import("@ebecerra/client-admin-sdk/server");
  const session = await readSession();
  if (!session) {
    redirect(`/admin/${slug}/login` as Parameters<typeof redirect>[0]);
  }
  // Si no es operator y el tenant no matchea, también fuera.
  // (Por ahora todos los logins son operator → bypass.)
  await requireSession({ redirectTo: `/admin/${slug}/login` });

  const display = DEMO_DISPLAY_NAME[slug] ?? slug;

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{display} · chatbot</h1>
          <p className="admin-page__subtitle">
            Sesión <code>{session!.email}</code> · tenant <code>{slug}</code>
          </p>
        </div>
        <LogoutButton
          className="admin-logout"
          apiPath={`/admin/${slug}/api/auth/logout`}
          redirectTo={`/admin/${slug}/login`}
        />
      </header>

      <UsageWidget slug={slug} />

      <h2 className="admin-page__section-title">Sesiones recientes</h2>
      <ChatbotSessions slug={slug} />
    </div>
  );
}
