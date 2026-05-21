"use client";

import { useEffect, useState } from "react";

type Usage = {
  period_start: string;
  conversations_count: number;
  messages_count: number;
  tokens_total: number;
  monthly_limit: number;
};

export function UsageWidget() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/chatbot/usage");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { usage: Usage };
        if (!cancelled) setUsage(data.usage);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="admin-usage admin-usage--error">{error}</div>;
  if (!usage) return <div className="admin-usage admin-usage--loading">Loading…</div>;

  const pct = usage.monthly_limit
    ? Math.round((usage.messages_count / usage.monthly_limit) * 100)
    : 0;

  return (
    <div className="admin-usage">
      <div className="admin-usage__stats">
        <div className="admin-usage__stat">
          <span className="admin-usage__num">{usage.conversations_count}</span>
          <span className="admin-usage__label">conversations</span>
        </div>
        <div className="admin-usage__stat">
          <span className="admin-usage__num">
            {usage.messages_count}
            <small> / {usage.monthly_limit}</small>
          </span>
          <span className="admin-usage__label">messages</span>
        </div>
        <div className="admin-usage__stat">
          <span className="admin-usage__num">{usage.tokens_total.toLocaleString("en-US")}</span>
          <span className="admin-usage__label">tokens</span>
        </div>
      </div>
      <div className="admin-usage__bar">
        <div className="admin-usage__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
