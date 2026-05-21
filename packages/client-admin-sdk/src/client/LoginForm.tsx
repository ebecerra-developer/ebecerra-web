"use client";

import { useState, type FormEvent } from "react";

export type LoginFormProps = {
  /** Nombre del negocio para mostrar en el form. */
  tenantName?: string;
  /** Path del API de login. Default /api/auth/login. */
  apiPath?: string;
};

export function LoginForm({ tenantName, apiPath = "/api/auth/login" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          (data as { error?: { message?: string } })?.error?.message ??
            "No se pudo enviar el enlace de acceso."
        );
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="ec-login ec-login--sent">
        <h1>Comprueba tu email</h1>
        <p>
          Si <strong>{email}</strong> tiene acceso a {tenantName ?? "este admin"},
          recibirás un enlace para entrar. Caduca en 15 minutos.
        </p>
        <p className="ec-login__hint">
          ¿No te llega? Revisa spam, o{" "}
          <button
            type="button"
            className="ec-login__link-button"
            onClick={() => {
              setStatus("idle");
              setEmail("");
            }}
          >
            vuelve a intentarlo
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form className="ec-login" onSubmit={handleSubmit}>
      <h1>Acceso{tenantName ? ` · ${tenantName}` : ""}</h1>
      <p>Te mando un enlace al email para entrar. Sin contraseñas.</p>
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
          placeholder="tu@email.com"
        />
      </label>
      <button type="submit" disabled={!email || status === "sending"}>
        {status === "sending" ? "Enviando…" : "Enviar enlace"}
      </button>
      {error && <p className="ec-login__error">{error}</p>}
    </form>
  );
}
