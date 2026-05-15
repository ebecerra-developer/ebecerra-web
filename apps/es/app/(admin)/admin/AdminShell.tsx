import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "./actions";

type AdminShellProps = {
  children: ReactNode;
  /** Identifica la sección activa para resaltar el link en la nav. */
  activeSection: "chatbot" | "comments";
  userEmail: string;
};

export default function AdminShell({
  children,
  activeSection,
  userEmail,
}: AdminShellProps) {
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>ebecerra · admin</h1>
        <nav className="admin-nav">
          <Link href="/admin/chatbot" data-active={activeSection === "chatbot"}>
            Chatbot
          </Link>
          <Link href="/admin/comments" data-active={activeSection === "comments"}>
            Comentarios
          </Link>
        </nav>
        <div className="admin-user">
          <span>{userEmail}</span>
          <form action={signOutAction}>
            <button type="submit">Salir</button>
          </form>
        </div>
      </header>
      <main className="admin-section">{children}</main>
    </div>
  );
}
