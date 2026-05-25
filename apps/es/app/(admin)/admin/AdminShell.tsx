import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "./actions";

type AdminShellProps = {
  children: ReactNode;
  /** Identifica la sección activa para resaltar el link en la nav. */
  activeSection: "chatbot" | "comments" | "bookings" | "social";
  userEmail: string;
  /** Flags por módulo del current user. Operators (role owner/editor) ven todo. */
  permissions?: { chatbot?: boolean; bookings?: boolean; social?: boolean };
  /** Si true, ignora permissions y muestra todas las pestañas. */
  isOperator?: boolean;
};

export default function AdminShell({
  children,
  activeSection,
  userEmail,
  permissions,
  isOperator,
}: AdminShellProps) {
  const showChatbot = isOperator || permissions?.chatbot !== false;
  const showBookings = isOperator || permissions?.bookings === true;
  const showSocial = isOperator || permissions?.social === true;
  const showComments = isOperator; // V1: solo operator. Si un cliente quiere, se añade flag.

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>ebecerra · admin</h1>
        <nav className="admin-nav">
          {showChatbot && (
            <Link href="/admin/chatbot" data-active={activeSection === "chatbot"}>
              Chatbot
            </Link>
          )}
          {showBookings && (
            <Link href="/admin/bookings" data-active={activeSection === "bookings"}>
              Reservas
            </Link>
          )}
          {showSocial && (
            <Link href="/admin/social" data-active={activeSection === "social"}>
              Social
            </Link>
          )}
          {showComments && (
            <Link href="/admin/comments" data-active={activeSection === "comments"}>
              Comentarios
            </Link>
          )}
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
