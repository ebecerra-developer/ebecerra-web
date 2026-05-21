"use client";

import { useEffect, useState } from "react";
import type { AdminMessage } from "./types";

export type SessionDetailProps = {
  apiPath?: string;
  sessionId: string;
};

/**
 * Vista detallada de una sesión específica. Útil para enlace directo o link compartido.
 * Reusa el mismo endpoint que MessagesView pero presenta la conversación sola, sin sidebar.
 */
export function SessionDetail({ apiPath = "/api/admin/chatbot", sessionId }: SessionDetailProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiPath}/messages?session=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { messages: AdminMessage[] };
        const ordered = [...(data.messages ?? [])].sort((a, b) =>
          a.created_at < b.created_at ? -1 : 1
        );
        if (!cancelled) setMessages(ordered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiPath, sessionId]);

  if (loading) return <p className="cb-session-detail__loading">Cargando…</p>;
  if (error) return <p className="cb-session-detail__error">{error}</p>;

  return (
    <ol className="cb-session-detail">
      {messages.map((m) => (
        <li key={m.id} className={`cb-session-detail__msg is-${m.role}`}>
          <header>
            <span className="cb-session-detail__role">{labelForRole(m.role)}</span>
            <time>{new Date(m.created_at).toLocaleString()}</time>
          </header>
          <p>{m.content}</p>
        </li>
      ))}
    </ol>
  );
}

function labelForRole(role: AdminMessage["role"]): string {
  if (role === "user") return "Usuario";
  if (role === "assistant") return "Asistente";
  return "Sistema";
}
