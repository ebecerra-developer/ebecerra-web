import { z } from "zod";

const serverSchema = z.object({
  SANITY_REVALIDATE_SECRET: z
    .string()
    .min(1, "SANITY_REVALIDATE_SECRET is required"),
  // Chatbot multi-tenant: cada demoSite tiene su propio tenant.
  // El proxy /api/chatbot enruta por demoSlug a la key correspondiente.
  CHATBOT_API_URL: z.url().optional(),
  CHATBOT_TENANT_KEY_EQUILIBRIO: z.string().optional(),
  CHATBOT_TENANT_KEY_MARTA_SOLANA: z.string().optional(),
  CHATBOT_TENANT_KEY_CLAUDIA_ENTRENA: z.string().optional(),
  CHATBOT_TENANT_KEY_ECO: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    console.error("Invalid server env vars:", fieldErrors);
    throw new Error(
      `Invalid server environment variables: ${Object.keys(fieldErrors).join(", ")}`
    );
  }
  cached = parsed.data;
  return cached;
}
