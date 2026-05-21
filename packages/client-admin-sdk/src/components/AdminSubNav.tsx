import Link from "next/link";
import type { AdminModule } from "../types";

export type AdminSubNavProps = {
  modules: AdminModule[];
  /** Key del módulo activo. */
  activeKey?: string;
};

export function AdminSubNav({ modules, activeKey }: AdminSubNavProps) {
  return (
    <nav className="admin-subnav" aria-label="Módulos del admin">
      <div className="admin-subnav__inner">
        {modules.map((m) => {
          const isActive = m.key === activeKey;
          const classes = [
            "admin-subnav__link",
            isActive ? "is-active" : "",
            m.disabled ? "is-disabled" : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (m.disabled) {
            return (
              <span key={m.key} className={classes} aria-disabled="true">
                {m.icon ? <span aria-hidden="true">{m.icon}</span> : null}
                {m.label}
                {m.badge && <span className="admin-subnav__badge">{m.badge}</span>}
              </span>
            );
          }

          return (
            <Link
              key={m.key}
              href={m.href as Parameters<typeof Link>[0]["href"]}
              className={classes}
              aria-current={isActive ? "page" : undefined}
            >
              {m.icon ? <span aria-hidden="true">{m.icon}</span> : null}
              {m.label}
              {m.badge && <span className="admin-subnav__badge">{m.badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
