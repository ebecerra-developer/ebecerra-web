import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { serverEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  postSlug: z.string().min(1).max(120),
  authorName: z.string().trim().min(1).max(80),
  authorEmail: z.email().optional().or(z.literal("")),
  body: z.string().trim().min(1).max(4000),
  /** Honeypot anti-bot. */
  website: z.string().max(0).optional(),
});

export async function POST(request: NextRequest) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid payload", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot: 200 silencioso.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { postSlug, authorName, authorEmail, body } = parsed.data;

  // ip_hash: dato pseudonimizado para auditoría y posible rate-limiting futuro.
  const xff = request.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  const supabase = createSupabaseAdminClient();
  const { error: insertError } = await supabase.from("post_comments").insert({
    post_slug: postSlug,
    author_name: authorName,
    author_email: authorEmail || null,
    body,
    status: "pending",
    ip_hash: ipHash,
  });

  if (insertError) {
    console.error("[/api/blog/comment] insert failed:", insertError);
    return NextResponse.json(
      { message: "internal error" },
      { status: 500 }
    );
  }

  // Notifica a admin vía Resend para moderar (best effort, no rompe la respuesta).
  const env = serverEnv();
  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
    const fromAddress = env.CONTACT_FROM_EMAIL ?? "no-reply@ebecerra.es";
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: `Blog · ebecerra.es <${fromAddress}>`,
        to: env.CONTACT_TO_EMAIL,
        subject: `Comentario pendiente · /${postSlug}`,
        text: `Nuevo comentario en /blog/${postSlug}/

De: ${authorName}${authorEmail ? ` <${authorEmail}>` : ""}

${body}

Modera en: https://ebecerra.es/admin/comments`,
      });
    } catch (err) {
      console.error("[/api/blog/comment] email notification failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
