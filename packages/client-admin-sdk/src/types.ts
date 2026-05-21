export type SessionRole = "owner" | "editor" | "client";

export type SessionPayload = {
  email: string;
  tenant_id: string;
  tenant_slug?: string;
  role: SessionRole;
  exp: number; // epoch seconds
};

/**
 * Marca del cliente — se muestra en el header y en el title.
 */
export type AdminBrand = {
  /** Nombre del cliente (ej: "Llaullau", "Equilibrio"). */
  name: string;
  /** Subtítulo opcional debajo del nombre (ej: "Admin"). */
  tagline?: string;
  /** Href del logo / volver al index del admin. Default "/admin". */
  homeHref?: string;
  /** Logo opcional como React node. Si no, se renderiza el nombre. */
  logo?: React.ReactNode;
};

/**
 * Un módulo del admin (chatbot, reservas, integraciones, etc).
 * El SDK no impone cuáles existen — cada app declara los suyos.
 */
export type AdminModule = {
  /** Identificador único (slug). Se usa para `is-active` en el nav. */
  key: string;
  /** Texto visible en el nav y en el card. */
  label: string;
  /** Descripción breve (solo en el card del index). */
  description?: string;
  /** Path absoluto al módulo (ej: "/admin/chatbot"). */
  href: string;
  /** Glyph o icono opcional (string emoji o React node). */
  icon?: React.ReactNode;
  /** Si está deshabilitado se ve gris en el index y no es clickable. */
  disabled?: boolean;
  /** Etiqueta opcional ("Pronto", "Beta", "v2") junto al label. */
  badge?: string;
};
