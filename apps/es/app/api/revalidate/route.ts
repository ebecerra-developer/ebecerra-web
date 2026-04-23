import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const HOME_TYPES = new Set([
  "heroSection",
  "siteSettings",
  "profile",
  "serviceSectionMeta",
  "processSectionMeta",
  "casesSectionMeta",
  "contactSectionMeta",
  "service",
  "processStep",
  "caseStudy",
]);

const FAQ_TYPES = new Set(["faqItem", "faqPage"]);

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

    if (_type && FAQ_TYPES.has(_type)) {
      revalidatePath("/faq", "page");
      revalidatePath("/en/faq", "page");
      revalidated.push("/faq", "/en/faq");
    } else if (_type === "legalPage" && slug) {
      revalidatePath(`/${slug}`, "page");
      revalidatePath(`/en/${slug}`, "page");
      revalidated.push(`/${slug}`, `/en/${slug}`);
    } else {
      revalidatePath("/", "page");
      revalidatePath("/en", "page");
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
