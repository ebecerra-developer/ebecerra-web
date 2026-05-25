"use client";

import { useEffect, useState } from "react";

interface Props {
  jobId: string;
  initialStatus: string;
  initialSignedUrl: string | null;
  initialError: string | null;
  initialRunUrl: string | null;
}

const POLL_MS = 3000;

export default function JobStatusPoller({
  jobId,
  initialStatus,
  initialSignedUrl,
  initialError,
  initialRunUrl,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [signedUrl, setSignedUrl] = useState(initialSignedUrl);
  const [error, setError] = useState(initialError);
  const [runUrl, setRunUrl] = useState(initialRunUrl);

  useEffect(() => {
    if (status === "done" || status === "failed" || status === "cancelled") return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`/api/admin/social/jobs/${jobId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          job: { status: string; error_message: string | null; gh_run_url: string | null };
          signedUrl: string | null;
        };
        if (cancelled) return;
        setStatus(data.job.status);
        setError(data.job.error_message);
        setRunUrl(data.job.gh_run_url);
        if (data.signedUrl) setSignedUrl(data.signedUrl);
      } catch {
        // silencio — siguiente tick lo reintenta
      }
    }

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId, status]);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        Estado:{" "}
        <span className="admin-pill" data-app={status}>
          {status}
        </span>
      </div>

      {(status === "queued" || status === "rendering") && (
        <div
          style={{
            padding: 24,
            border: "1px dashed #44403c",
            borderRadius: 6,
            color: "#a8a29e",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            {status === "queued"
              ? "En cola — esperando a que arranque el worker…"
              : "Renderizando… (Playwright + GitHub Actions, ~30-60s)"}
          </div>
          {runUrl && (
            <a
              href={runUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#34d399", fontSize: 13 }}
            >
              Ver run en GitHub Actions →
            </a>
          )}
        </div>
      )}

      {status === "failed" && (
        <div
          style={{
            padding: 16,
            border: "1px solid #7f1d1d",
            background: "#1c0a0a",
            borderRadius: 4,
            color: "#fecaca",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Render fallido</div>
          <div style={{ fontSize: 13, fontFamily: "monospace" }}>{error ?? "Sin detalles"}</div>
          {runUrl && (
            <a
              href={runUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fca5a5", fontSize: 13, display: "block", marginTop: 12 }}
            >
              Ver logs en GitHub →
            </a>
          )}
        </div>
      )}

      {status === "done" && signedUrl && (
        <div>
          <div
            style={{
              border: "1px solid #44403c",
              borderRadius: 4,
              overflow: "hidden",
              maxWidth: 540,
              marginBottom: 16,
              background: "#000",
            }}
          >
            <img
              src={signedUrl}
              alt="Render"
              style={{ width: "100%", display: "block" }}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href={signedUrl}
              download={`${jobId}.png`}
              style={{
                background: "#047857",
                color: "#fafaf9",
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Descargar PNG
            </a>
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                border: "1px solid #44403c",
                color: "#d6d3d1",
                padding: "10px 20px",
                borderRadius: 4,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Abrir en pestaña nueva
            </a>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#a8a29e" }}>
            Enlace de descarga válido durante 1 hora. Recarga la página para refrescar.
          </div>
        </div>
      )}
    </div>
  );
}
