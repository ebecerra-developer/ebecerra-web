export type SessionRole = "owner" | "editor" | "client";

export type SessionPayload = {
  email: string;
  tenant_id: string;
  tenant_slug?: string;
  role: SessionRole;
  exp: number; // epoch seconds
};
