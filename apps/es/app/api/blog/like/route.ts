import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  slug: z.string().min(1).max(120),
});

const FP_COOKIE = "eb_fp";
const FP_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

function getOrCreateFingerprint(request: NextRequest): {
  fp: string;
  isNew: boolean;
} {
  const existing = request.cookies.get(FP_COOKIE)?.value;
  if (existing && existing.length >= 8) return { fp: existing, isNew: false };
  return {
    fp:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fp_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`,
    isNew: true,
  };
}

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
      { message: "invalid payload" },
      { status: 400 }
    );
  }
  const { slug } = parsed.data;

  const { fp, isNew } = getOrCreateFingerprint(request);
  const supabase = createSupabaseAdminClient();

  // Asegura fila en post_likes (idempotente).
  await supabase
    .from("post_likes")
    .upsert({ post_slug: slug }, { onConflict: "post_slug", ignoreDuplicates: true });

  // Intenta registrar el like por este fingerprint. Si el UNIQUE (slug, fp) ya
  // existe, no incrementa.
  const { error: logError } = await supabase
    .from("post_likes_log")
    .insert({ post_slug: slug, fingerprint: fp });

  let alreadyLiked = false;
  if (logError) {
    // Postgres unique violation = ya había liked desde este fingerprint.
    if (logError.code === "23505") {
      alreadyLiked = true;
    } else {
      console.error("[/api/blog/like] log insert failed:", logError);
      return NextResponse.json(
        { message: "internal error" },
        { status: 500 }
      );
    }
  }

  if (!alreadyLiked) {
    // Incrementa el contador denormalizado.
    const { error: incError } = await supabase.rpc("increment_post_likes", {
      slug_input: slug,
    });
    if (incError) {
      console.error("[/api/blog/like] rpc failed:", incError);
      // Fallback: UPDATE manual (race condition aceptable a este volumen).
      const { data: row } = await supabase
        .from("post_likes")
        .select("count")
        .eq("post_slug", slug)
        .maybeSingle();
      await supabase
        .from("post_likes")
        .update({ count: (row?.count ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("post_slug", slug);
    }
  }

  // Devuelve el contador actualizado.
  const { data: countRow } = await supabase
    .from("post_likes")
    .select("count")
    .eq("post_slug", slug)
    .maybeSingle();

  const response = NextResponse.json({
    count: countRow?.count ?? 0,
    alreadyLiked,
  });
  if (isNew) {
    response.cookies.set(FP_COOKIE, fp, {
      maxAge: FP_MAX_AGE,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}
