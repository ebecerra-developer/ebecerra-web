import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// AI crawlers explicitly allowed to index and cite this site.
// Listing them by name (instead of relying on the wildcard) signals
// intent and is the de-facto standard recommended by web.dev and
// Google/Anthropic guidance on AEO.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "Google-Extended",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Applebot-Extended",
  "meta-externalagent",
  "Bytespider",
  "CCBot",
];

const DISALLOW = ["/studio", "/api", "/playground"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("host") ?? "";

  // Subdominios funcionales (API only): noindex global, sin sitemap.
  if (host.startsWith("chats.") || host.startsWith("admin.")) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_AGENTS.map((agent) => ({
        userAgent: agent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: "https://ebecerra.es/sitemap.xml",
    host: "https://ebecerra.es",
  };
}
