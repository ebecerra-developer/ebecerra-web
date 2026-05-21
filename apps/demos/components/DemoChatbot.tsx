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

  // Logging opt-in: si hay tenant key configurada en este deploy, el chat se
  // loguea en el backend SaaS central. Mostramos aviso con link a la política
  // de ebecerra.es (las demos no tienen privacidad propia).
  const loggingDisclaimers =
    process.env[`CHATBOT_TENANT_KEY_${demo.slug.toUpperCase().replace(/-/g, "_")}`]
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
      apiPath="/api/chatbot"
      disclaimers={[...baseDisclaimers, ...loggingDisclaimers]}
      extraBody={{ demoSlug: demo.slug }}
    />
  );
}
