import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  try {
    if (secret !== serverEnv().SANITY_REVALIDATE_SECRET) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 }
    );
  }
}
