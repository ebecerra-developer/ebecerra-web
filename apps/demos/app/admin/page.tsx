import Link from "next/link";
import { DEMO_DISPLAY_NAME, TENANT_KEY_BY_DEMO } from "./_lib/tenant";

export const metadata = { title: "Admin · demos.ebecerra.es" };

export default function AdminIndexPage() {
  const available = Object.entries(TENANT_KEY_BY_DEMO)
    .filter(([, key]) => Boolean(key))
    .map(([slug]) => slug);

  return (
    <div className="admin-shell" data-template="fisio">
      <div
        style={{
          maxWidth: "560px",
          margin: "clamp(48px, 10vh, 90px) auto 0",
          padding: "36px 32px 32px",
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: "var(--admin-radius)",
          boxShadow: "var(--admin-shadow)",
        }}
      >
        <h1 className="admin-page__title" style={{ marginBottom: "6px" }}>
          Admin · demos
        </h1>
        <p className="admin-page__lead">
          Elige el demo cuyo panel quieres abrir. Cada uno tiene su propio
          login y solo ve sus propias conversaciones.
        </p>
        {available.length === 0 ? (
          <p className="admin-empty">No hay tenants configurados.</p>
        ) : (
          <div className="admin-modules" style={{ gridTemplateColumns: "1fr" }}>
            {available.map((slug) => (
              <Link
                key={slug}
                href={`/admin/${slug}/login` as Parameters<typeof Link>[0]["href"]}
                className="admin-module-card"
              >
                <span className="admin-module-card__title">
                  {DEMO_DISPLAY_NAME[slug] ?? slug}
                </span>
                <span className="admin-module-card__arrow">Abrir →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
