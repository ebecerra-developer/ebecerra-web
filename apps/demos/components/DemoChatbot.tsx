import type { DemoSite } from "@ebecerra/sanity-client";
import { ChatbotWidget } from "@ebecerra/chatbot/client";

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

  return (
    <ChatbotWidget
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
      disclaimers={
        config.disclaimers.length > 0
          ? config.disclaimers
          : [
              isEs
                ? "Demo de ebecerra.es · ¿Quieres una web así? Visita ebecerra.es"
                : "Demo by ebecerra.es · Want a site like this? Visit ebecerra.es",
            ]
      }
      extraBody={{ demoSlug: demo.slug }}
    />
  );
}
