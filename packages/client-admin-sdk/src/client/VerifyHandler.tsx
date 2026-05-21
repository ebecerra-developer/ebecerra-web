"use client";

import { useEffect, useState } from "react";

export type VerifyHandlerProps = {
  /** Path del API verify. Default /api/auth/verify. */
  apiPath?: string;
  /** Path al que redirigir tras verify OK. Default /admin/chatbot. */
  redirectTo?: string;
};

export function VerifyHandler({
  apiPath = "/api/auth/verify",
  redirectTo = "/admin/chatbot",
}: VerifyHandlerProps) {
  const [status, setStatus] = useState<"verifying" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setError("Falta el token en la URL.");
      return;
    }

    void (async () => {
      try {
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(
            (data as { error?: { message?: string } })?.error?.message ??
              "El enlace es inválido o ha caducado."
          );
          setStatus("error");
          return;
        }
        // Cookie ya está fijada por el server side. Redirigir.
        window.location.replace(redirectTo);
      } catch {
        setError("Error de red al verificar.");
        setStatus("error");
      }
    })();
  }, [apiPath, redirectTo]);

  if (status === "verifying") {
    return (
      <div className="ec-verify">
        <p>Verificando enlace…</p>
      </div>
    );
  }

  return (
    <div className="ec-verify ec-verify--error">
      <h1>No se pudo entrar</h1>
      <p>{error}</p>
      <p>
        <a href="/admin/login">Solicitar enlace nuevo</a>
      </p>
    </div>
  );
}
