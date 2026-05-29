// Run from apps/es:
//   node --env-file=.env.local scripts/inspect-faq.mjs
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const items = await client.fetch(
  `*[_type == "faqItem"] | order(order asc){_id, _rev, order, category, question, answer}`
);
console.log(JSON.stringify(items, null, 2));
