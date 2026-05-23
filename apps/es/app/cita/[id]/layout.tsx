import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gestionar cita · ebecerra",
  robots: { index: false, follow: false, nocache: true },
};

export default function CitaLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: "#f6f6f6" }}>{children}</body>
    </html>
  );
}
