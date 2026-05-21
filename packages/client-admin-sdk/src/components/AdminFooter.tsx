import type { AdminBrand } from "../types";

export type AdminFooterProps = {
  brand: AdminBrand;
  version?: string;
};

export function AdminFooter({ brand, version }: AdminFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="admin-footer">
      <span className="admin-footer__copy">
        © {year} {brand.name} · Admin
      </span>
      {version && <span className="admin-footer__version">{version}</span>}
    </footer>
  );
}
