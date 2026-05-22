import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { handleSyncWebhook } from "@ebecerra/chatbot-saas/sanity-sync";
import { handleBookingsSyncWebhook } from "@ebecerra/bookings/sanity-sync";

const FAQ_TYPES = new Set(["faqItem", "faqPage"]);
const CHATBOT_SYNC_TYPES = new Set(["profile", "demoSite", "chatbotConfig"]);
const BOOKINGS_SYNC_TYPES = new Set(["bookingTenantConfig", "bookingService"]);
const EBECERRA_SANITY_PROJECT_ID = "gdtxcn4l";

const DEMOS_REVALIDATE_URL = "https://demos.ebecerra.es/api/revalidate";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  try {
    if (secret !== serverEnv().SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // no body — fallback to home revalidation
    }

    const _type = typeof body._type === "string" ? body._type : undefined;
    const slug = typeof body.slug === "string" ? body.slug : undefined;
    const _id = typeof body._id === "string" ? body._id : undefined;
    const revalidated: string[] = [];

    // Fan-out: cuando el doc es demoSite, este endpoint revalida la galería
    // pública /ejemplos en apps/es Y reenvía el evento al endpoint /api/revalidate
    // de apps/demos. Plan free de Sanity solo permite 2 webhooks; con esto
    // cubrimos los tres dominios desde un solo webhook.
    if (_type === "demoSite") {
      revalidatePath("/ejemplos", "page");
      revalidatePath("/en/ejemplos", "page");
      revalidated.push("/ejemplos", "/en/ejemplos");

      try {
        const url = new URL(DEMOS_REVALIDATE_URL);
        url.searchParams.set("secret", secret);
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _type, slug }),
        });
      } catch (err) {
        console.error("Fan-out to demos failed:", err);
      }
    } else if (_type && FAQ_TYPES.has(_type)) {
      revalidatePath("/faq", "page");
      revalidatePath("/en/faq", "page");
      revalidated.push("/faq", "/en/faq");
    } else if (_type === "legalPage" && slug) {
      revalidatePath(`/${slug}`, "page");
      revalidatePath(`/en/${slug}`, "page");
      revalidated.push(`/${slug}`, `/en/${slug}`);
    } else {
      revalidatePath("/", "layout");
      revalidated.push("/", "/en");
    }

    // Fan-out chatbot: si el doc afecta a la config del chatbot multi-tenant,
    // disparamos la sincronización al cache de Supabase. Llamada local (misma
    // función Vercel), no HTTP, no requiere auth extra.
    if (_type && _id && CHATBOT_SYNC_TYPES.has(_type)) {
      try {
        const result = await handleSyncWebhook({
          sanityProjectId: EBECERRA_SANITY_PROJECT_ID,
          payload: body as { _id: string; _type: string; _rev?: string },
        });
        if (!result.ok) {
          console.warn("[revalidate→chatbot sync] skip:", result.reason);
        }
      } catch (err) {
        console.error("[revalidate→chatbot sync] failed:", err);
      }
    }

    // Fan-out bookings: idem para el sistema de reservas. Reutilizamos este
    // webhook de Sanity en vez de añadir uno nuevo (plan free solo permite 2).
    if (_type && _id && BOOKINGS_SYNC_TYPES.has(_type)) {
      try {
        const result = await handleBookingsSyncWebhook({
          sanityProjectId: EBECERRA_SANITY_PROJECT_ID,
          payload: body as { _id: string; _type: string; _rev?: string },
        });
        if (!result.ok) {
          console.warn("[revalidate→bookings sync] skip:", result.reason);
        }
      } catch (err) {
        console.error("[revalidate→bookings sync] failed:", err);
      }
    }

    return NextResponse.json({ revalidated: true, paths: revalidated, timestamp: Date.now() });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 }
    );
  }
}
