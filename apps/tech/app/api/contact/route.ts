import { createHash } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { serverEnv } from "@/lib/env";
import { getTechContactFormBackend } from "@ebecerra/sanity-client";
import type { ContactFormBackend } from "@ebecerra/sanity-client";

const rate = new Map<string, { count: number; ts: number }>();
const RATE_WINDOW = 60_000;
const RATE_MAX = 3;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rate.get(ip);
  if (!entry || now - entry.ts > RATE_WINDOW) {
    rate.set(ip, { count: 1, ts: now });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  return false;
}

let cachedSchema: ContactFormBackend | null = null;
let cachedAt = 0;
const SCHEMA_TTL = 5 * 60_000;

async function getSchema(): Promise<ContactFormBackend | null> {
  const now = Date.now();
  if (cachedSchema && now - cachedAt < SCHEMA_TTL) return cachedSchema;
  try {
    const schema = await getTechContactFormBackend();
    cachedSchema = schema;
    cachedAt = now;
    return schema;
  } catch {
    return cachedSchema;
  }
}

function humanizeKey(key: string): string {
  const parts = key.replace(/^s\d+_/, "").split("_");
  const text = parts.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type AnswerValue = string | string[];
type Payload = {
  answers: Record<string, AnswerValue>;
  gdpr: boolean;
  website?: string;
};

function isPayload(x: unknown): x is Payload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.gdpr === "boolean" &&
    typeof o.answers === "object" &&
    o.answers !== null
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ message: "too many requests" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ message: "invalid json" }, { status: 400 });
  }
  if (!isPayload(json)) {
    return NextResponse.json({ message: "invalid payload" }, { status: 400 });
  }
  const { answers, gdpr, website } = json;
  if (website && website.length > 0) {
    return NextResponse.json({ ok: true });
  }
  if (!gdpr) {
    return NextResponse.json({ message: "gdpr required" }, { status: 400 });
  }

  const schema = await getSchema();
  if (schema) {
    for (const field of schema.fields) {
      const v = answers[field.key];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim().length === 0) ||
        (Array.isArray(v) && v.length === 0);
      if (field.required && empty) {
        return NextResponse.json(
          { message: "missing required", key: field.key },
          { status: 400 }
        );
      }
      if (!empty && field.type === "email" && typeof v === "string") {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          return NextResponse.json(
            { message: "invalid email", key: field.key },
            { status: 400 }
          );
        }
      }
    }
  }

  const env = serverEnv();
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) {
    return NextResponse.json(
      { message: "contact form disabled" },
      { status: 503 }
    );
  }
  const fromAddress = env.CONTACT_FROM_EMAIL ?? "no-reply@ebecerra.tech";

  const keys = Object.keys(answers).sort();
  const bodyLines: string[] = [];
  let nameForSubject = "";
  let replyTo: string | undefined;
  for (const k of keys) {
    const v = answers[k];
    const text = Array.isArray(v) ? v.join(", ") : String(v);
    bodyLines.push(`${humanizeKey(k)}: ${text}`);
    if (!nameForSubject && /name/i.test(k)) nameForSubject = text;
    if (!replyTo && /email/i.test(k) && /@/.test(text)) replyTo = text;
  }

  const fingerprint = createHash("sha256")
    .update(JSON.stringify(answers))
    .digest("hex")
    .slice(0, 32);

  const resend = new Resend(env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send(
    {
      from: `ebecerra.tech <${fromAddress}>`,
      to: [env.CONTACT_TO_EMAIL],
      replyTo: replyTo ?? undefined,
      subject: `[ebecerra.tech · contacto] ${nameForSubject || "Nuevo mensaje"}`,
      text: bodyLines.join("\n"),
    },
    { idempotencyKey: `contact-form/${fingerprint}` }
  );

  if (error) {
    console.error("Resend send failed:", error.message);
    return NextResponse.json({ message: "send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
