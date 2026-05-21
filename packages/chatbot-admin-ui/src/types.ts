export type AdminMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  tokens_input: number;
  tokens_output: number;
  origin: string | null;
  created_at: string;
};

export type AdminSessionSummary = {
  session_id: string;
  message_count: number;
  first_at: string;
  last_at: string;
};

export type AdminUsage = {
  period_start: string;
  conversations_count: number;
  messages_count: number;
  tokens_total: number;
  monthly_limit?: number;
};
