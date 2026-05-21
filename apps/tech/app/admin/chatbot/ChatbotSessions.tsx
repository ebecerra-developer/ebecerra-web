"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SessionRow = {
  session_id: string;
  message_count: number;
  first_at: string;
  last_at: string;
};

export function ChatbotSessions() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/chatbot/sessions?limit=100");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { sessions: SessionRow[] };
        if (!cancelled) setSessions(data.sessions ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="ec-login__error">{error}</p>;
  if (sessions.length === 0)
    return <div className="admin-empty">No sessions yet.</div>;

  return (
    <div className="admin-sessions">
      {sessions.map((s) => (
        <Link
          key={s.session_id}
          href={`/admin/chatbot/sessions/${s.session_id}`}
          className="admin-sessions__item"
        >
          <div>
            <div className="admin-sessions__id">{s.session_id.slice(0, 12)}…</div>
            <div className="admin-sessions__preview">
              {s.message_count} {s.message_count === 1 ? "msg" : "msgs"}
            </div>
          </div>
          <div className="admin-sessions__meta">
            {new Date(s.last_at).toLocaleString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
            <div className="admin-sessions__arrow">→</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
