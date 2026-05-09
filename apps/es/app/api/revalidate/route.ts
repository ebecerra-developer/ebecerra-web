import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const FAQ_TYPES = new Set(["faqItem", "faqPage"]);

const DEMOS_REVALIDATE_URL = "https://demos.ebecerra.es/api/revalidate";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  try {
    if (secret !== serverEnv().SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    let body: { _type?: string; slug?: string } = {};
    try {
      body = await request.json();
    } catch {
      // no body — fallback to home revalidation
    }

    const { _type, slug } = body;
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

    return NextResponse.json({ revalidated: true, paths: revalidated, timestamp: Date.now() });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 }
    );
  }
}
