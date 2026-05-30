// Seed Fase 6 ebecerra.es — 2026-05-30 (Blog + FAQ editables).
//
// Crea/actualiza:
//  - blogPage-singleton (NUEVO): todo el chrome del blog (listado + post detail)
//  - faqPage (UPDATE): kicker/title/lead/contactSection*/contactCta con copy
//    actual (el doc existe pero podía estar vacío o solo con metaTitle)
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-fase6-2026-05-30.mjs --commit

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const FAQ_PAGE_ID = "2fccf962-b05c-4377-a421-efa1cca17b78";
const BLOG_PAGE_ID = "blogPage-singleton";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- blogPage (createOrReplace) ---------------------------------------------

const blogPageDoc = {
  _id: BLOG_PAGE_ID,
  _type: "blogPage",
  metaTitle: localeStr(
    "Blog · Web profesional, IA y SEO para autónomos y PYMEs",
    "Blog · Professional web, AI and SEO for freelancers and SMBs"
  ),
  metaDescription: localeStr(
    "Artículos sobre web profesional, chatbots con IA, SEO y decisiones técnicas para autónomos y PYMEs. Sin jerga, con criterio.",
    "Articles on professional websites, AI chatbots, SEO and technical decisions for freelancers and SMBs. No jargon, with judgment."
  ),
  kicker: localeStr("// BLOG", "// BLOG"),
  title: localeStr("Artículos", "Articles"),
  lead: localeTxt(
    "Sobre web profesional, IA aplicada al negocio, SEO y decisiones técnicas. Sin jerga, con criterio.",
    "On professional websites, AI applied to business, SEO and technical decisions. No jargon, with judgment."
  ),
  empty: localeStr(
    "Aún no hay artículos publicados.",
    "No articles published yet."
  ),
  filterAll: localeStr("Todas", "All"),
  filterCategory: localeStr("Categoría", "Category"),
  sortNewest: localeStr("Más recientes", "Newest first"),
  sortOldest: localeStr("Más antiguos", "Oldest first"),
  backToList: localeStr("← Volver al blog", "← Back to blog"),
  byPrefix: localeStr("por", "by"),
  byAuthor: localeStr("por {name}", "by {name}"),
  publishedOn: localeStr("Publicado el {date}", "Published on {date}"),
  updatedOn: localeStr("Actualizado el {date}", "Updated on {date}"),
  tocLabel: localeStr("En este artículo", "In this article"),
  shareLabel: localeStr("Compartir", "Share"),
  relatedHeading: localeStr("Artículos relacionados", "Related articles"),
  likeLabel: localeStr("Me ha gustado", "I liked it"),
  likeThanks: localeStr("¡Gracias!", "Thanks!"),
  commentsHeading: localeStr("Comentarios", "Comments"),
  commentsEmpty: localeStr(
    "Sé el primero en comentar.",
    "Be the first to comment."
  ),
  commentForm: {
    title: localeStr("Deja un comentario", "Leave a comment"),
    name: localeStr("Nombre", "Name"),
    email: localeStr("Email", "Email"),
    emailHint: localeStr("(opcional, no se publica)", "(optional, not published)"),
    body: localeStr("Comentario", "Comment"),
    submit: localeStr("Enviar", "Submit"),
    submitting: localeStr("Enviando…", "Sending…"),
    success: localeStr(
      "Tu comentario está pendiente de moderación. ¡Gracias!",
      "Your comment is pending moderation. Thanks!"
    ),
    error: localeStr(
      "No se pudo enviar. Inténtalo en un momento.",
      "Couldn't send. Please try again."
    ),
    privacy: localeStr(
      "Los comentarios se revisan antes de publicarse.",
      "Comments are reviewed before publishing."
    ),
  },
};

// --- faqPage (patch.set) ----------------------------------------------------

const faqPagePatch = {
  metaTitle: localeStr(
    "Preguntas frecuentes",
    "Frequently asked questions"
  ),
  metaDescription: localeStr(
    "Plazos, formas de pago, revisiones de diseño, mantenimiento, Kit Digital, NDA y hosting. Lo que suelen preguntarme autónomos y PYMEs antes de arrancar un proyecto web.",
    "Timelines, payment terms, design revisions, maintenance, Kit Digital, NDAs and hosting. The questions freelancers and SMBs ask me before starting a web project."
  ),
  kicker: localeStr("// FAQ", "// FAQ"),
  title: localeStr("Preguntas frecuentes", "Frequently asked questions"),
  lead: localeTxt(
    "Lo que suelen preguntarme antes de arrancar. Si lo tuyo no está aquí, escríbeme y te respondo en 24 h laborables.",
    "What people usually ask before we start. If your question isn't here, drop me a line and I reply within 24 business hours."
  ),
  contactSectionTitle: localeStr(
    "¿Sigues con dudas?",
    "Still have doubts?"
  ),
  contactSectionLead: localeTxt(
    "Cuéntame tu caso y te doy una primera idea del alcance sin compromiso.",
    "Tell me your case and I'll give you a first idea of scope, no strings attached."
  ),
  contactCta: localeStr("Escribirme", "Write to me"),
};

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }
  console.log(`Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
  if (!COMMIT) {
    console.log(" - blogPage-singleton (createOrReplace)");
    console.log(" - faqPage (patch.set on", FAQ_PAGE_ID, ")");
    return;
  }
  console.log("Writing blogPage-singleton...");
  await client.createOrReplace(blogPageDoc);
  console.log("Patching faqPage...");
  await client.patch(FAQ_PAGE_ID).set(faqPagePatch).commit();
  console.log("\nDone. Fase 6 seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
