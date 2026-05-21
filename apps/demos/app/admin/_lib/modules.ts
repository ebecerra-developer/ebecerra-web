import type { AdminBrand, AdminModule } from "@ebecerra/client-admin-sdk/components";
import { DEMO_DISPLAY_NAME } from "./tenant";

export function brandForSlug(slug: string): AdminBrand {
  return {
    name: DEMO_DISPLAY_NAME[slug] ?? slug,
    tagline: "Admin · demo",
    homeHref: `/admin/${slug}`,
  };
}

export function modulesForSlug(slug: string): AdminModule[] {
  return [
    {
      key: "chatbot",
      label: "Chatbot",
      description:
        "Conversaciones del asistente con clientes, consumo de tokens y límites mensuales.",
      href: `/admin/${slug}/chatbot`,
      icon: "💬",
    },
  ];
}

export const ADMIN_VERSION = "v0.2";
