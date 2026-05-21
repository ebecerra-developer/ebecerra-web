import type { Metadata } from "next";
import "@ebecerra/client-admin-sdk/styles/admin-base.css";
import "./brand-bridge.css";

export const metadata: Metadata = {
  title: "Admin · ebecerra.tech",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
