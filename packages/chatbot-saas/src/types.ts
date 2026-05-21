/**
 * Tipos compartidos del sistema chatbot multi-tenant.
 */

export type TenantStatus = "active" | "paused" | "archived";
export type ConfigSource = "sanity_proxy" | "central_supabase" | "inline";

export type SanityMatchType = "document_id" | "document_type";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  config_source: ConfigSource;
  sanity_project_id: string | null;
  sanity_dataset: string | null;
  sanity_workspace: string | null;
  sanity_document_id: string | null;
  sanity_match_type: SanityMatchType;
  sanity_field_path: string | null;
  tenant_key_hash: string;
  tenant_key_prefix: string;
  status: TenantStatus;
  monthly_message_limit: number;
  admin_base_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatTone = "cordial" | "formal" | "cercano" | "tecnico";
export type ChatLanguage = "es" | "en";
export type WidgetPosition = "bottom-right" | "bottom-left";

export type BusinessInfo = {
  name?: string;
  description?: string;
  address?: string;
  hours?: string;
  services?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
};

export type Faq = {
  question: string;
  answer: string;
  tags?: string[];
};

export type ChatbotConfig = {
  tenant_id: string;
  system_prompt: string;
  greeting: string;
  tone: ChatTone;
  language: ChatLanguage;
  business_info: BusinessInfo;
  faqs: Faq[];
  primary_color: string;
  position: WidgetPosition;
  avatar_url: string | null;
  bubble_label: string | null;
  model: string;
  synced_at: string;
  source_revision: string | null;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatRequestBody = {
  sessionId: string;
  messages: ChatMessage[];
};

export type AuditAction =
  | "tenant.created"
  | "tenant.updated"
  | "tenant.archived"
  | "key.rotated"
  | "config.synced"
  | "config.sync_failed"
  | "quota.exceeded"
  | "chat.completed"
  | "chat.failed"
  | "auth.failed"
  | "auth.magic_link.requested"
  | "auth.magic_link.sent"
  | "auth.magic_link.verified"
  | "auth.magic_link.invalid";

export type AuditEntry = {
  tenant_id: string | null;
  actor_email?: string | null;
  action: AuditAction;
  details?: Record<string, unknown>;
};
