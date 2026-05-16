import type { DemoSite } from "@ebecerra/sanity-client";
import ChatbotLoader from "./ChatbotLoader";

/**
 * Wrapper del chatbot para demos.
 *
 * Se monta DENTRO del `<div data-template="…">` de cada plantilla para que
 * los CSS vars scopeados (`--chatbot-*` definidos en demos-<template>.css)
 * apliquen al widget.
 *
 * Si la demo no tiene chatbot configurado o está desactivado, no renderiza nada.
 */
export default function DemoChatbot({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: string;
}) {
  const config = demo.chatbot;
  if (!config?.enabled) return null;

  const isEs = locale === "es";
  const businessName = demo.businessName;

  const baseDisclaimers =
    config.disclaimers.length > 0
      ? config.disclaimers
      : [
          isEs
            ? "Demo de ebecerra.es · ¿Quieres una web así? Visita ebecerra.es"
            : "Demo by ebecerra.es · Want a site like this? Visit ebecerra.es",
        ];

  // Logging opt-in: si las env vars de Supabase están en este deploy,
  // añadimos un aviso. Link cross-domain a la política de la web principal,
  // porque las demos no tienen su propia página /privacidad.
  const loggingDisclaimers =
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY
      ? [
          isEs
            ? "Esta conversación se guarda para mejorar el servicio. Más info en ebecerra.es/privacidad."
            : "This conversation is stored to improve the service. More info at ebecerra.es/privacy.",
        ]
      : [];

  return (
    <ChatbotLoader
      launcherLabel={config.label ?? (isEs ? "¿Te ayudo?" : "Need help?")}
      drawerTitle={config.title ?? `${businessName} · ${isEs ? "Recepción" : "Reception"}`}
      greeting={
        config.greeting ??
        (isEs
          ? `Hola, soy el asistente virtual de ${businessName}. ¿En qué puedo ayudarte?`
          : `Hi, I'm ${businessName}'s virtual assistant. How can I help?`)
      }
      placeholder={
        config.placeholder ??
        (isEs ? "Escribe tu pregunta…" : "Type your question…")
      }
      locale={locale}
      disclaimers={[...baseDisclaimers, ...loggingDisclaimers]}
      extraBody={{ demoSlug: demo.slug }}
    />
  );
}
