import { ImageResponse } from "next/og";
import type { Locale } from "@/i18n/routing";
import { getPostBySlug } from "@ebecerra/sanity-client";

export const runtime = "nodejs";
export const revalidate = 86400;

export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { locale: Locale; slug: string };
}) {
  const post = await getPostBySlug(params.slug, params.locale).catch(() => null);

  const title = post?.title ?? "ebecerra.es";
  const category = post?.category?.title ?? "blog";
  const authorName = post?.author?.name ?? "Enrique Becerra";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #fafaf9 0%, #ede9e3 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#047857",
            fontSize: 22,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          <span>{category}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#1c1917",
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#57534e",
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>{authorName}</span>
            <span style={{ margin: "0 12px", opacity: 0.5 }}>·</span>
            <span>ebecerra.es/blog</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: "#047857",
              fontFamily: "ui-monospace, monospace",
            }}
          >
            eB
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
