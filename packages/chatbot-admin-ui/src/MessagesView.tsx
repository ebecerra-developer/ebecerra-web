"use client";

import { useEffect, useState, useCallback } from "react";
import type { AdminMessage, AdminSessionSummary } from "./types";

export type MessagesViewProps = {
  /**
   * Ruta del API proxy local que devuelve mensajes del tenant actual.
   * El proxy añade X-Tenant-Key y reenvía a chats.ebecerra.es/api/v1/messages.
   *
   * Default: /api/admin/chatbot
   *
   * Endpoints esperados:
   *   GET {apiPath}/sessions          → AdminSessionSummary[]
   *   GET {apiPath}/messages?session= → AdminMessage[]
   */
  apiPath?: string;
  /**
   * Cuántas sesiones cargar inicialmente. Default 50.
   */
  initialSessionLimit?: number;
};

/**
 * Vista de mensajes del chatbot agrupada por sesión.
 * Lista de sesiones recientes a la izquierda, conversación expandida a la derecha.
 *
 * Estilo unstyled — usa className passthrough para integrar con el design system del host.
 */
export function MessagesView({
  apiPath = "/api/admin/chatbot",
  initialSessionLimit = 50,
}: MessagesViewProps) {
  const [sessions, setSessions] = useState<AdminSessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const res = await fetch(`${apiPath}/sessions?limit=${initialSessionLimit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { sessions: AdminSessionSummary[] };
      setSessions(data.sessions ?? []);
      if (data.sessions?.length && !selectedSessionId) {
        setSelectedSessionId(data.sessions[0].session_id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando sesiones");
    } finally {
      setLoadingSessions(false);
    }
  }, [apiPath, initialSessionLimit, selectedSessionId]);

  const loadMessages = useCallback(
    async (sessionId: string) => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await fetch(`${apiPath}/messages?session=${encodeURIComponent(sessionId)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { messages: AdminMessage[] };
        // Orden cronológico ascendente para lectura natural
        const ordered = [...(data.messages ?? [])].sort((a, b) =>
          a.created_at < b.created_at ? -1 : 1
        );
        setMessages(ordered);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando mensajes");
      } finally {
        setLoadingMessages(false);
      }
    },
    [apiPath]
  );

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (selectedSessionId) void loadMessages(selectedSessionId);
  }, [selectedSessionId, loadMessages]);

  return (
    <div className="cb-messages-view">
      <aside className="cb-messages-view__sidebar">
        <header className="cb-messages-view__sidebar-header">
          <h2>Sesiones</h2>
          <button type="button" onClick={() => void loadSessions()} aria-label="Recargar">
            ↻
          </button>
        </header>
        {loadingSessions ? (
          <p className="cb-messages-view__loading">Cargando…</p>
        ) : sessions.length === 0 ? (
          <p className="cb-messages-view__empty">Aún no hay conversaciones.</p>
        ) : (
          <ul className="cb-messages-view__session-list">
            {sessions.map((s) => (
              <li key={s.session_id}>
                <button
                  type="button"
                  className={
                    "cb-messages-view__session-item" +
                    (s.session_id === selectedSessionId ? " is-selected" : "")
                  }
                  onClick={() => setSelectedSessionId(s.session_id)}
                >
                  <span className="cb-messages-view__session-id">
                    {s.session_id.slice(0, 8)}…
                  </span>
                  <span className="cb-messages-view__session-meta">
                    {s.message_count} msg · {relativeTime(s.last_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <main className="cb-messages-view__main">
        {error && <p className="cb-messages-view__error">{error}</p>}
        {!selectedSessionId ? (
          <p className="cb-messages-view__empty">Selecciona una sesión para ver la conversación.</p>
        ) : loadingMessages ? (
          <p className="cb-messages-view__loading">Cargando mensajes…</p>
        ) : (
          <ol className="cb-messages-view__messages">
            {messages.map((m) => (
              <li key={m.id} className={`cb-messages-view__msg is-${m.role}`}>
                <header className="cb-messages-view__msg-header">
                  <span className="cb-messages-view__msg-role">{labelForRole(m.role)}</span>
                  <time>{new Date(m.created_at).toLocaleString()}</time>
                </header>
                <p className="cb-messages-view__msg-body">{m.content}</p>
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}

function labelForRole(role: AdminMessage["role"]): string {
  if (role === "user") return "Usuario";
  if (role === "assistant") return "Asistente";
  return "Sistema";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}
