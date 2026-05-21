import Link from "next/link";
import { DEMO_DISPLAY_NAME, TENANT_KEY_BY_DEMO } from "./_lib/tenant";

export const metadata = { title: "Admin · demos.ebecerra.es" };

export default function AdminIndexPage() {
  const available = Object.entries(TENANT_KEY_BY_DEMO)
    .filter(([, key]) => Boolean(key))
    .map(([slug]) => slug);

  return (
    <div className="admin-shell" data-template="fisio">
      <div className="admin-index">
        <h1>Admin · demos</h1>
        <p>Elige el demo cuyo panel quieres abrir.</p>
        {available.length === 0 ? (
          <p className="admin-empty">No hay tenants configurados.</p>
        ) : (
          <ul>
            {available.map((slug) => (
              <li key={slug}>
                <Link href={`/admin/${slug}/login`}>
                  <span>{DEMO_DISPLAY_NAME[slug] ?? slug}</span>
                  <span>→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
