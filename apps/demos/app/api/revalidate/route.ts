import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

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
      // sin body
    }

    const { _type, slug } = body;
    const revalidated: string[] = [];

    if (_type === "demoSite" && slug) {
      revalidatePath(`/${slug}`, "page");
      revalidatePath(`/en/${slug}`, "page");
      revalidated.push(`/${slug}`, `/en/${slug}`);
    } else {
      revalidatePath("/", "layout");
      revalidated.push("/", "/en");
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 }
    );
  }
}
