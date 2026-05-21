import Link from "next/link";
import type { AdminModule } from "../types";

export type ModuleGridProps = {
  modules: AdminModule[];
};

/**
 * Grid de cards para el index del admin (/admin). Una card por módulo.
 * Disabled → card semitransparente sin link.
 */
export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <div className="admin-modules">
      {modules.map((m) => {
        const inner = (
          <>
            {m.icon && (
              <span className="admin-module-card__icon" aria-hidden="true">
                {m.icon}
              </span>
            )}
            <span className="admin-module-card__title">
              {m.label}
              {m.badge && (
                <span className="admin-module-card__badge">{m.badge}</span>
              )}
            </span>
            {m.description && (
              <p className="admin-module-card__desc">{m.description}</p>
            )}
            <span className="admin-module-card__arrow">
              {m.disabled ? "Pronto" : "Abrir →"}
            </span>
          </>
        );

        if (m.disabled) {
          return (
            <div
              key={m.key}
              className="admin-module-card is-disabled"
              aria-disabled="true"
            >
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={m.key}
            href={m.href as Parameters<typeof Link>[0]["href"]}
            className="admin-module-card"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
