import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { serverEnv } from "@/lib/env";

const payloadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email(),
  message: z.string().trim().min(10).max(5000),
  /** Honeypot anti-bot: si llega no-vacío, tratamos como spam y devolvemos OK silencioso. */
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

  // Honeypot: devolvemos 200 sin enviar para no alertar al bot.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    return NextResponse.json(
      { message: "contact form disabled (missing RESEND_API_KEY or CONTACT_TO_EMAIL)" },
      { status: 503 }
    );
  }

  const fromAddress = env.CONTACT_FROM_EMAIL ?? "no-reply@ebecerra.es";

  // Idempotency: hash del payload normalizado → mismo formulario enviado
  // dos veces en 24h entrega UN solo email en vez de dos.
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        n: parsed.data.name,
        e: parsed.data.email,
        m: parsed.data.message,
      })
    )
    .digest("hex")
    .slice(0, 32);

  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    {
      from: `ebecerra.es <${fromAddress}>`,
      to: [env.CONTACT_TO_EMAIL],
      replyTo: parsed.data.email,
      subject: `[ebecerra.es · contacto] ${parsed.data.name}`,
      text: [
        `Nombre: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        "",
        parsed.data.message,
      ].join("\n"),
    },
    { idempotencyKey: `contact-form/${fingerprint}` }
  );

  if (error) {
    console.error("Resend send failed:", error.message);
    return NextResponse.json({ message: "send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
