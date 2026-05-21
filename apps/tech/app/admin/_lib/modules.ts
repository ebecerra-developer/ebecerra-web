import type { AdminBrand, AdminModule } from "@ebecerra/client-admin-sdk/components";

export const BRAND: AdminBrand = {
  name: "ebecerra.tech",
  tagline: "// admin",
  homeHref: "/admin",
};

export const MODULES: AdminModule[] = [
  {
    key: "chatbot",
    label: "Chatbot",
    description:
      "Conversaciones del asistente con visitantes, consumo de tokens y límites mensuales.",
    href: "/admin/chatbot",
    icon: "▶",
  },
];

export const ADMIN_VERSION = "v0.2";
