import type { AdminBrand, AdminModule } from "@ebecerra/client-admin-sdk/components";

export const BRAND: AdminBrand = {
  name: "ebecerra.es",
  tagline: "admin",
  homeHref: "/admin",
};

export const ALL_MODULES: AdminModule[] = [
  {
    key: "chatbot",
    label: "Chatbot",
    description: "Conversaciones del asistente, tenants y consumo de tokens.",
    href: "/admin/chatbot",
    icon: "💬",
  },
  {
    key: "bookings",
    label: "Reservas",
    description: "Citas confirmadas y pendientes por tenant.",
    href: "/admin/bookings",
    icon: "📅",
  },
  {
    key: "social",
    label: "Social",
    description: "Generador de contenido para Instagram y Facebook.",
    href: "/admin/social",
    icon: "🖼",
  },
  {
    key: "comments",
    label: "Comentarios",
    description: "Moderación de comentarios del blog.",
    href: "/admin/comments",
    icon: "💭",
  },
];

export const ADMIN_VERSION = "v0.3";

export type ModulePermissions = {
  chatbot?: boolean;
  bookings?: boolean;
  social?: boolean;
};

export function modulesForUser({
  permissions,
  isOperator,
}: {
  permissions?: ModulePermissions;
  isOperator?: boolean;
}): AdminModule[] {
  if (isOperator) return ALL_MODULES;
  const show = {
    chatbot: permissions?.chatbot !== false,
    bookings: permissions?.bookings === true,
    social: permissions?.social === true,
    comments: false,
  };
  return ALL_MODULES.filter((m) => show[m.key as keyof typeof show]);
}
