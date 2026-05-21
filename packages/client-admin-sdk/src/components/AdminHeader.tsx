import Link from "next/link";
import type { AdminBrand, SessionPayload } from "../types";
import { UserMenu } from "../client/UserMenu";

export type AdminHeaderProps = {
  brand: AdminBrand;
  session: Pick<SessionPayload, "email" | "role">;
  logoutApiPath?: string;
  loginPath?: string;
};

export function AdminHeader({
  brand,
  session,
  logoutApiPath,
  loginPath,
}: AdminHeaderProps) {
  const homeHref = brand.homeHref ?? "/admin";

  return (
    <header className="admin-header">
      <Link
        href={homeHref as Parameters<typeof Link>[0]["href"]}
        className="admin-header__brand"
      >
        {brand.logo ?? null}
        <span className="admin-header__brand-text">
          <span className="admin-header__brand-name">{brand.name}</span>
          {brand.tagline && (
            <span className="admin-header__brand-tagline">{brand.tagline}</span>
          )}
        </span>
      </Link>
      <UserMenu
        email={session.email}
        role={session.role}
        logoutApiPath={logoutApiPath}
        logoutRedirectTo={loginPath}
      />
    </header>
  );
}
