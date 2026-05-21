// Run from apps/es:
//   node --env-file=.env.local scripts/inspect-content.mjs
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const heroQ = `*[_type == "heroSection"][0]{_id, _rev, kicker, title, lead, ctaPrimary, ctaSecondary, trustBadges}`;
const servicesQ = `*[_type == "servicesPricing"][0]{
  _id, _rev,
  kicker, title, lead,
  "paths": paths[]{
    _key, id, label, tagline, isDefault,
    "tiers": tiers[]{
      _key, id, name, priceMain, priceSecondary, conditions,
      highlighted, badge,
      "features": features[]{ _key, text, highlight }
    }
  },
  migrationFootnote,
  addOnsSectionTitle, addOnsSectionLead,
  "addOns": addOns[]{ _key, title, price, note }
}`;

const hero = await client.fetch(heroQ);
const services = await client.fetch(servicesQ);

console.log("=== heroSection ===");
console.log(JSON.stringify(hero, null, 2));
console.log("\n=== servicesPricing ===");
console.log(JSON.stringify(services, null, 2));
