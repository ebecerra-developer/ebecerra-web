import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@ebecerra/client-admin-sdk/styles/admin-base.css";
import "./brand-bridge.css";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin · ebecerra",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="admin-body">{children}</body>
    </html>
  );
}
