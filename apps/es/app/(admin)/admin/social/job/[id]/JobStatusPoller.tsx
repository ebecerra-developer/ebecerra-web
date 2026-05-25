"use client";

import { useEffect, useState } from "react";

interface Props {
  jobId: string;
  initialStatus: string;
  initialSignedUrl: string | null;
  initialError: string | null;
  initialRunUrl: string | null;
  isOperator: boolean;
}

const POLL_MS = 3000;

// Mensajes rotativos durante el render — dan sensación de progreso
// aunque GH Actions no expone steps en tiempo real.
const PROGRESS_MESSAGES = [
  "Analizando plantilla…",
  "Preparando lienzo…",
  "Aplicando paleta de marca…",
  "Componiendo tipografías…",
  "Acomodando elementos…",
  "Cargando recursos visuales…",
  "Pintando capas…",
  "Refinando detalles…",
  "Generando imagen final…",
  "Subiendo a la nube…",
];
const ROTATE_MS = 2500;

export default function JobStatusPoller({
  jobId,
  initialStatus,
  initialSignedUrl,
  initialError,
  initialRunUrl,
  isOperator,
}: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [signedUrl, setSignedUrl] = useState(initialSignedUrl);
  const [error, setError] = useState(initialError);
  const [runUrl, setRunUrl] = useState(initialRunUrl);
  const [msgIdx, setMsgIdx] = useState(0);

  // Polling de estado del job
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
        // silencio — siguiente tick reintenta
      }
    }

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [jobId, status]);

  // Rotación de mensajes mientras está queued/rendering
  useEffect(() => {
    if (status !== "queued" && status !== "rendering") return;
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % PROGRESS_MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [status]);

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
            padding: 32,
            border: "1px solid #44403c",
            borderRadius: 8,
            background: "#0c0a09",
            textAlign: "center",
            maxWidth: 540,
          }}
        >
          {/* Spinner sobrio */}
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              border: "3px solid #292524",
              borderTopColor: "#047857",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div
            key={msgIdx}
            style={{
              color: "#e7e5e4",
              fontSize: 15,
              fontWeight: 500,
              animation: "fadeIn 0.5s ease",
            }}
          >
            {PROGRESS_MESSAGES[msgIdx]}
          </div>
          <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
          <div style={{ color: "#78716c", fontSize: 12, marginTop: 12 }}>
            El proceso suele tardar 30-60 segundos.
          </div>
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
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            No hemos podido generar la imagen
          </div>
          <div style={{ fontSize: 13 }}>
            {isOperator ? (error ?? "Sin detalles") : "Algo ha fallado durante el render. Vuelve a intentarlo o avísanos si persiste."}
          </div>
          {isOperator && runUrl && (
            <a
              href={runUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#fca5a5", fontSize: 13, display: "block", marginTop: 12 }}
            >
              Ver logs técnicos →
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
