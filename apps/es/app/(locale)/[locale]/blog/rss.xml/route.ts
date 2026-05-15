import type { NextRequest } from "next/server";
import type { Locale } from "@/i18n/routing";
import { getPosts } from "@ebecerra/sanity-client";

export const revalidate = 3600;

const SITE_URL = "https://ebecerra.es";

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ locale: Locale }> }
) {
  const { locale } = await params;
  const posts = await getPosts(locale, { limit: 50 });

  const blogUrl =
    locale === "es" ? `${SITE_URL}/blog/` : `${SITE_URL}/${locale}/blog/`;
  const feedTitle =
    locale === "es"
      ? "ebecerra.es · Blog"
      : "ebecerra.es · Blog (English)";
  const feedDescription =
    locale === "es"
      ? "Web profesional, IA y SEO para autónomos y PYMEs."
      : "Professional web, AI and SEO for freelancers and SMBs.";

  const items = posts
    .map((post) => {
      const postUrl =
        locale === "es"
          ? `${SITE_URL}/blog/${post.slug}/`
          : `${SITE_URL}/${locale}/blog/${post.slug}/`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escape(post.excerpt)}</description>
      ${post.author?.name ? `<author>${escape(post.author.name)}</author>` : ""}
      ${post.category ? `<category>${escape(post.category.title)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(feedTitle)}</title>
    <link>${blogUrl}</link>
    <atom:link href="${blogUrl}rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(feedDescription)}</description>
    <language>${locale === "es" ? "es-ES" : "en-US"}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
