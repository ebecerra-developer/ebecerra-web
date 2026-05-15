import type { MetadataRoute } from "next";

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

export default function robots(): MetadataRoute.Robots {
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
