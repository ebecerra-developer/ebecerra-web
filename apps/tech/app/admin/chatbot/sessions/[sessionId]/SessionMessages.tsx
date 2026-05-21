"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_input: number;
  tokens_output: number;
  created_at: string;
};

export function SessionMessages({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/chatbot/messages?session=${encodeURIComponent(sessionId)}&limit=200`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { messages: Message[] };
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
  }, [sessionId]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="ec-login__error">{error}</p>;
  if (messages.length === 0) return <div className="admin-empty">No messages in this session.</div>;

  return (
    <ol className="admin-chat">
      {messages.map((m) => (
        <li key={m.id} className={`admin-chat__msg is-${m.role}`}>
          <header className="admin-chat__msg-header">
            <span className="admin-chat__role">
              {m.role === "user" ? "user" : "assistant"}
            </span>
            <time>
              {new Date(m.created_at).toLocaleString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </time>
          </header>
          <div className="admin-chat__body">{m.content}</div>
          {m.role === "assistant" && m.model && (
            <footer className="admin-chat__meta">
              <span>{m.model}</span>
              <span>{m.tokens_input + m.tokens_output} tokens</span>
            </footer>
          )}
        </li>
      ))}
    </ol>
  );
}
