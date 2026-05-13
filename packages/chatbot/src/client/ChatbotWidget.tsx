"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import styles from "./ChatbotWidget.module.css";
import { readChatbotStream } from "./sse";
import type { ChatMessage } from "../types";

export type ChatbotWidgetProps = {
  /** Etiqueta visible del botón flotante. Ej: "¿Te ayudo?" */
  launcherLabel: string;
  /** Cabecera del drawer. Ej: "Recepción · Equilibrio" */
  drawerTitle: string;
  /** Primer mensaje del bot al abrir el chat. */
  greeting: string;
  /** Placeholder del input. */
  placeholder: string;
  /** Locale del usuario, enviado al servidor. */
  locale: string;
  /** Avisos al pie del chat. Vacío = no se renderiza. */
  disclaimers?: string[];
  /** Ruta del endpoint. Default `/api/chat`. */
  apiPath?: string;
  /**
   * Campos extra a inyectar en el body del POST junto a `messages` y `locale`.
   * Usado, p. ej., por demos para enviar `demoSlug`.
   */
  extraBody?: Record<string, unknown>;
};

/**
 * Widget de chatbot embebible. Mobile-first.
 *
 * Renderiza un botón flotante bottom-right; al hacer click abre un drawer
 * (full-screen en móvil, panel acotado en desktop) con la conversación.
 *
 * No usa createPortal: el render se mantiene en el árbol DOM natural,
 * así los CSS vars scoped (--chatbot-* dentro de un [data-template=…])
 * se heredan sin necesidad de prop `templateScope`.
 */
export function ChatbotWidget({
  launcherLabel,
  drawerTitle,
  greeting,
  placeholder,
  locale,
  disclaimers,
  apiPath = "/api/chat",
  extraBody,
}: ChatbotWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: greeting },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const titleId = useId();

  // Auto-scroll al final cuando llegan mensajes nuevos o tokens streamed
  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open, streaming]);

  // Focus al input al abrir
  useEffect(() => {
    if (open) {
      // pequeño delay para esperar el slide-up
      const t = window.setTimeout(() => inputRef.current?.focus(), 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Escape cierra el drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Cancela petición en curso al desmontar / cerrar
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = { role: "user", content: text };
      const next: ChatMessage[] = [...messages, userMsg];
      // placeholder vacío para el assistant — se va llenando con tokens
      setMessages([...next, { role: "assistant", content: "" }]);
      setStreaming(true);
      setError(null);

      const ctrl = new AbortController();
      abortRef.current?.abort();
      abortRef.current = ctrl;

      try {
        const res = await fetch(apiPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, locale, ...extraBody }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(
            `Servidor devolvió ${res.status}. Inténtalo en un momento.`
          );
        }

        let acc = "";
        for await (const ev of readChatbotStream(res.body, ctrl.signal)) {
          if (ev.type === "text") {
            acc += ev.value;
            setMessages((prev) => {
              const copy = prev.slice();
              copy[copy.length - 1] = { role: "assistant", content: acc };
              return copy;
            });
          } else if (ev.type === "error") {
            throw new Error(ev.message);
          }
          // ev.type === "done" → fin natural
        }
      } catch (err) {
        if (ctrl.signal.aborted) return;
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudo conectar con el chat.";
        setError(msg);
        // limpiar el assistant vacío si nunca llegó nada
        setMessages((prev) => {
          if (prev[prev.length - 1]?.content === "") return prev.slice(0, -1);
          return prev;
        });
      } finally {
        setStreaming(false);
      }
    },
    [apiPath, locale, messages, extraBody]
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || streaming) return;
      setInput("");
      void send(trimmed);
    },
    [input, streaming, send]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || streaming) return;
        setInput("");
        void send(trimmed);
      }
    },
    [input, streaming, send]
  );

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.launcher}
        data-open={open ? "true" : "false"}
        onClick={() => setOpen(true)}
        aria-label={launcherLabel}
        aria-expanded={open}
      >
        <svg
          className={styles.launcherIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        <span>{launcherLabel}</span>
      </button>

      {open && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header className={styles.header}>
              <h2 id={titleId} className={styles.title}>
                {drawerTitle}
              </h2>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className={styles.messages} aria-live="polite">
              {messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                if (
                  m.role === "assistant" &&
                  isLast &&
                  streaming &&
                  m.content === ""
                ) {
                  return (
                    <div key={i} className={styles.typing} aria-label="Escribiendo">
                      <span />
                      <span />
                      <span />
                    </div>
                  );
                }
                return (
                  <div
                    key={i}
                    className={styles.message}
                    data-role={m.role}
                  >
                    {m.content}
                  </div>
                );
              })}
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSubmit}>
              <div className={styles.inputRow}>
                <textarea
                  ref={inputRef}
                  className={styles.input}
                  rows={1}
                  placeholder={placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={streaming}
                />
                <button
                  type="submit"
                  className={styles.send}
                  disabled={streaming || !input.trim()}
                  aria-label="Enviar"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              {disclaimers && disclaimers.length > 0 && (
                <ul className={styles.disclaimers}>
                  {disclaimers.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}
