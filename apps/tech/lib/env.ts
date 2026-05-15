import { z } from "zod";

const serverSchema = z.object({
  SANITY_REVALIDATE_SECRET: z
    .string()
    .min(1, "SANITY_REVALIDATE_SECRET is required"),
  SANITY_API_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  CONTACT_TO_EMAIL: z.email().optional(),
  CONTACT_FROM_EMAIL: z.email().optional(),
  GROQ_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
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
