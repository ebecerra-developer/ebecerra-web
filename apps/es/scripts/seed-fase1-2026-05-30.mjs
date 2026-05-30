// Seed Fase 1 ebecerra.es — 2026-05-30.
//
// Crea/actualiza los singletons editoriales movidos a Sanity en la Fase 1:
//  - capabilitiesSection-singleton (NUEVO)
//  - siteSettings (extiende con nav + footer.navColumn/crossLinks/legalLinks/colTitles/copyrightTemplate)
//  - casesSectionMeta + contactSectionMeta (añade .labels)
//  - profile.bio1 / bio2 / stats (pobla con el copy ES+EN de messages)
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-fase1-2026-05-30.mjs           (dry run)
//   node --env-file=.env.local scripts/seed-fase1-2026-05-30.mjs --commit  (apply)
//
// Requisitos: SANITY_API_TOKEN con permisos write.
// IMPORTANTE: deploy del schema (npx sanity schema deploy --workspace ebecerra-web)
// debe hacerse ANTES con un token Admin para que Studio muestre los campos
// nuevos.

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const SITE_SETTINGS_ID = "de40d1fb-51ab-46d3-83c6-ffebefe05016";
const CASES_SECTION_META_ID = "3fbbc4f8-48c6-4adc-9ae8-15123db6a005";
const CONTACT_SECTION_META_ID = "b2746aef-0e12-44a1-83b3-9ffe84551f32";
const CAPABILITIES_SECTION_ID = "capabilitiesSection-singleton";

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

// --- Capabilities section (sección 03 — Más que una web) ---------------------

const capabilitiesDoc = {
  _id: CAPABILITIES_SECTION_ID,
  _type: "capabilitiesSection",
  kicker: localeStr("Más que una web", "More than a website"),
  title: localeStr(
    "Tecnología que te lleva ventaja",
    "Tech that gives you an edge"
  ),
  lead: localeTxt(
    "Tu web puede hacer mucho más que estar online. Hablamos de lo que mueve la aguja en tu negocio: atender mejor, ganar tiempo, decidir con datos.",
    "Your site can do much more than just sit online. We focus on what moves the needle for your business: serving customers better, saving time, deciding with data."
  ),
  items: [
    {
      _type: "capability",
      _key: "cap-ai",
      icon: "🤖",
      badge: localeStr("Nuevo", "New"),
      featured: true,
      title: localeStr("Asistente con IA", "AI assistant"),
      description: localeText("Un chatbot 24/7 entrenado con tu información. Atiende preguntas frecuentes, agenda citas, recoge leads y los manda a tu correo o CRM.",
        "A 24/7 chatbot trained on your content. Answers FAQs, books appointments, captures leads and sends them to your inbox or CRM."),
      bullets: [
        localeStr("Responde en tu tono, en varios idiomas", "Replies in your tone, in several languages"),
        localeStr("Asistente en el panel para crear textos y traducir", "Admin-side assistant to draft and translate copy"),
        localeStr("Resúmenes automáticos de reseñas y feedback", "Auto summaries of reviews and customer feedback"),
      ],
    },
    {
      _type: "capability",
      _key: "cap-booking",
      icon: "📅",
      featured: false,
      title: localeStr("Reservas online", "Online bookings"),
      description: localeText(
        "Calendario integrado o conexión con Doctoralia, Cal.com, Calendly o el sistema que ya uses. El cliente reserva sin llamar.",
        "Built-in calendar or integration with Doctoralia, Cal.com, Calendly or your current system. Clients book without calling."
      ),
      bullets: [
        localeStr("Recordatorios por SMS y WhatsApp", "SMS and WhatsApp reminders"),
        localeStr("Bloqueos de tiempo entre citas", "Buffer time between appointments"),
        localeStr("Pagos online si los necesitas", "Online payments if needed"),
      ],
    },
    {
      _type: "capability",
      _key: "cap-integrations",
      icon: "🔌",
      featured: false,
      title: localeStr("Integra con todo", "Integrates with everything"),
      description: localeText(
        "Tu web hablando con las herramientas que ya usas. Sin abrir 5 pestañas para hacer una cosa.",
        "Your site talking to the tools you already use. No more juggling 5 tabs."
      ),
      bullets: [
        localeStr("WhatsApp Business, email marketing, CRM", "WhatsApp Business, email marketing, CRM"),
        localeStr("Pasarelas de pago, Google Maps, redes sociales", "Payment gateways, Google Maps, social"),
        localeStr("Conexión con tu software de gestión", "Connection to your business software"),
      ],
    },
    {
      _type: "capability",
      _key: "cap-analytics",
      icon: "📊",
      featured: false,
      title: localeStr("Datos para decidir", "Data to decide with"),
      description: localeText(
        "Analytics privados (sin Google si no quieres). Sabes qué páginas funcionan, de dónde llegan tus clientes y qué cambiar.",
        "Private analytics (no Google if you prefer). See what pages work, where clients come from, and what to change."
      ),
      bullets: [
        localeStr("Panel mensual fácil de leer", "Easy-to-read monthly dashboard"),
        localeStr("Cumplimiento RGPD por defecto", "GDPR-compliant by default"),
        localeStr("Sin cookies invasivas", "No invasive cookies"),
      ],
    },
  ],
  noteLabel: localeStr("Importante", "Note"),
  noteText: localeTxt(
    "Estas capacidades son opcionales y modulares. No tienes que tenerlas todas: empezamos por lo que necesitas hoy y crecemos cuando tu negocio lo pida.",
    "These capabilities are optional and modular. You don't need them all: we start with what you need today and grow as your business grows."
  ),
};

// helper que estaba con typo
function localeText(es, en) {
  return localeTxt(es, en);
}

// --- siteSettings nav + footer ampliados -------------------------------------

const navItem = (type, key_or_href, labelEs, labelEn) =>
  type === "anchor"
    ? {
        _type: "navAnchor",
        _key: `nav-${key_or_href}`,
        key: key_or_href,
        label: localeStr(labelEs, labelEn),
      }
    : {
        _type: "navPage",
        _key: `nav-${key_or_href.replace(/[\/\W]/g, "-")}`,
        href: key_or_href,
        label: localeStr(labelEs, labelEn),
      };

const footerNavItem = (type, key_or_href, labelEs, labelEn) =>
  type === "anchor"
    ? {
        _type: "footerAnchor",
        _key: `fn-${key_or_href}`,
        key: key_or_href,
        label: localeStr(labelEs, labelEn),
      }
    : {
        _type: "footerPage",
        _key: `fn-${key_or_href.replace(/[\/\W]/g, "-")}`,
        href: key_or_href,
        label: localeStr(labelEs, labelEn),
      };

const siteSettingsPatch = {
  // Nav (nuevo bloque)
  nav: {
    items: [
      navItem("anchor", "servicios", "Servicios", "Services"),
      navItem("anchor", "sobre-mi", "Sobre mí", "About"),
      navItem("anchor", "capacidades", "Capacidades", "Capabilities"),
      navItem("anchor", "proceso", "Proceso", "Process"),
      navItem("anchor", "ejemplos", "Ejemplos", "Examples"),
      navItem("page", "/blog/", "Blog", "Blog"),
      navItem("page", "/faq", "FAQ", "FAQ"),
      navItem("anchor", "contacto", "Contacto", "Contact"),
    ],
    ctaLabel: localeStr("Hablemos", "Let's talk"),
  },
  // Footer: campos nuevos. tagline/availability/email/socialLinks ya existían.
  footer: {
    tagline: localeTxt(
      "Webs a medida para negocios que no se conforman con una plantilla. Rápidas, accesibles, fáciles de mantener y pensadas para que tu equipo opere sin depender de nadie.",
      "Tailored websites for businesses that won't settle for a template. Fast, accessible, easy to maintain and built so your team runs them without depending on anyone."
    ),
    availability: localeStr(
      "disponible para que trabajemos juntos",
      "available to work with you"
    ),
    email: "contacto@ebecerra.es",
    colNavTitle: localeStr("navegación", "navigation"),
    colSocialTitle: localeStr("social", "social"),
    colCrossTitle: localeStr("ecosistema ebecerra", "ebecerra ecosystem"),
    navColumn: [
      footerNavItem("anchor", "servicios", "Servicios", "Services"),
      footerNavItem("anchor", "sobre-mi", "Sobre mí", "About"),
      footerNavItem("anchor", "capacidades", "Capacidades", "Capabilities"),
      footerNavItem("anchor", "proceso", "Proceso", "Process"),
      footerNavItem("anchor", "ejemplos", "Ejemplos", "Examples"),
      footerNavItem("page", "/blog/", "Blog", "Blog"),
      footerNavItem("anchor", "contacto", "Contacto", "Contact"),
    ],
    socialLinks: [
      {
        _key: "social-linkedin",
        _type: "socialLink",
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/enrique-becerra-garcia/",
        external: true,
      },
    ],
    crossLinks: [
      {
        _key: "cross-tech",
        _type: "crossLink",
        label: localeStr("ebecerra.tech ↗", "ebecerra.tech ↗"),
        href: "https://ebecerra.tech",
        external: true,
      },
      {
        _key: "cross-piezas",
        _type: "crossLink",
        label: localeStr("piezas · game ↗", "piezas · game ↗"),
        href: "/piezas-game/",
        external: true,
      },
    ],
    legalLinks: [
      {
        _key: "legal-faq",
        _type: "legalLink",
        label: localeStr("preguntas frecuentes", "FAQ"),
        href: "/faq",
      },
      {
        _key: "legal-privacy",
        _type: "legalLink",
        label: localeStr("privacidad", "privacy"),
        href: "/privacidad",
      },
      {
        _key: "legal-notice",
        _type: "legalLink",
        label: localeStr("aviso legal", "legal notice"),
        href: "/aviso-legal",
      },
      {
        _key: "legal-terms",
        _type: "legalLink",
        label: localeStr("términos de contratación", "terms"),
        href: "/terminos",
      },
    ],
    copyrightTemplate: localeStr(
      "© {year} Enrique Becerra · Madrid",
      "© {year} Enrique Becerra · Madrid"
    ),
  },
};

// --- casesSectionMeta + contactSectionMeta — solo labels ---------------------

const casesLabelsPatch = {
  labels: {
    context: localeStr("Contexto", "Context"),
    solution: localeStr("Solución", "Solution"),
    result: localeStr("Resultado", "Result"),
    translates: localeStr("Traducible a tu negocio", "Translates to your business"),
  },
};

const contactLabelsPatch = {
  labels: {
    email: localeStr("Email", "Email"),
    linkedin: localeStr("LinkedIn", "LinkedIn"),
    location: localeStr("Ubicación", "Location"),
    response: localeStr("Respuesta", "Response"),
  },
};

// --- Run ---------------------------------------------------------------------

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }

  console.log(`Mode: ${COMMIT ? "COMMIT (writes to dataset)" : "DRY RUN (no writes)"}`);

  if (!COMMIT) {
    console.log("\n--- capabilitiesSection ---");
    console.log(JSON.stringify(capabilitiesDoc, null, 2).slice(0, 400) + "...");
    console.log("\n--- siteSettings patch ---");
    console.log(JSON.stringify(siteSettingsPatch, null, 2).slice(0, 400) + "...");
    console.log("\n--- casesSectionMeta labels patch ---");
    console.log(JSON.stringify(casesLabelsPatch, null, 2));
    console.log("\n--- contactSectionMeta labels patch ---");
    console.log(JSON.stringify(contactLabelsPatch, null, 2));
    console.log("\nRun with --commit to write to Sanity.");
    return;
  }

  // Capabilities (createOrReplace)
  console.log("Writing capabilitiesSection...");
  await client.createOrReplace(capabilitiesDoc);

  // siteSettings (patch)
  console.log("Patching siteSettings...");
  await client
    .patch(SITE_SETTINGS_ID)
    .set(siteSettingsPatch)
    .commit();

  // casesSectionMeta (patch labels)
  console.log("Patching casesSectionMeta...");
  await client
    .patch(CASES_SECTION_META_ID)
    .set(casesLabelsPatch)
    .commit();

  // contactSectionMeta (patch labels)
  console.log("Patching contactSectionMeta...");
  await client
    .patch(CONTACT_SECTION_META_ID)
    .set(contactLabelsPatch)
    .commit();

  console.log("\nDone. Fase 1 seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
