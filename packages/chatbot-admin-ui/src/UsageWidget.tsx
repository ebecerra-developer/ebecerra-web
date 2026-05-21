"use client";

import { useEffect, useState } from "react";
import type { AdminUsage } from "./types";

export type UsageWidgetProps = {
  /**
   * Ruta del API proxy local. Default /api/admin/chatbot/usage.
   * Devuelve AdminUsage del mes corriente.
   */
  apiPath?: string;
};

export function UsageWidget({ apiPath = "/api/admin/chatbot/usage" }: UsageWidgetProps) {
  const [usage, setUsage] = useState<AdminUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiPath);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { usage: AdminUsage };
        if (!cancelled) setUsage(data.usage);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiPath]);

  if (loading) return <div className="cb-usage-widget cb-usage-widget--loading">Cargando…</div>;
  if (error || !usage) return <div className="cb-usage-widget cb-usage-widget--error">{error ?? "Sin datos"}</div>;

  const pct = usage.monthly_limit ? Math.round((usage.messages_count / usage.monthly_limit) * 100) : null;

  return (
    <div className="cb-usage-widget">
      <header>
        <h3>Uso este mes</h3>
        <p>Desde {new Date(usage.period_start).toLocaleDateString()}</p>
      </header>
      <dl className="cb-usage-widget__stats">
        <div>
          <dt>Conversaciones</dt>
          <dd>{usage.conversations_count}</dd>
        </div>
        <div>
          <dt>Mensajes</dt>
          <dd>
            {usage.messages_count}
            {usage.monthly_limit ? ` / ${usage.monthly_limit}` : ""}
          </dd>
        </div>
        <div>
          <dt>Tokens (estimado)</dt>
          <dd>{usage.tokens_total.toLocaleString()}</dd>
        </div>
      </dl>
      {pct !== null && (
        <div className="cb-usage-widget__bar" aria-label={`${pct}% de la quota mensual`}>
          <div className="cb-usage-widget__bar-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
