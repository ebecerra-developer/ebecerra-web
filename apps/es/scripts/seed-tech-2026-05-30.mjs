// Seed Fase 3 ebecerra.tech — 2026-05-30.
//
// Crea:
//  - techHomeSections-singleton (todo el copy editorial del home)
//  - techSiteSettings-singleton (nav + footer + metadata)
//  - techContactFormStep-s1 + techContactFormSettings-singleton (form wizard)
//
// Uso desde apps/es (mismo dataset gdtxcn4l):
//   node --env-file=.env.local scripts/seed-tech-2026-05-30.mjs           (dry run)
//   node --env-file=.env.local scripts/seed-tech-2026-05-30.mjs --commit  (apply)

import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const localeStr = (es, en) => ({ _type: "localeString", es, en });
const localeTxt = (es, en) => ({ _type: "localeText", es, en });

const homeSections = {
  _id: "techHomeSections-singleton",
  _type: "techHomeSections",
  hero: {
    available: localeStr("DISPONIBLE", "AVAILABLE"),
    firstName: "Enrique",
    lastName: "Becerra",
    tagline: localeTxt(
      "Tech Architect Lead — construyo software que funciona, forma equipos y perdura.",
      "Tech Architect Lead — I build software that works, shapes teams, and lasts."
    ),
    ctaContact: localeStr("→ contactar", "→ contact"),
    ctaProjects: localeStr("→ ver proyectos", "→ see projects"),
    terminal: {
      title: "~/portfolio",
      placeholder: localeStr("escribe un comando...", "type a command..."),
      cdBlocked: localeStr(
        "bash: cd: no puedes escapar de aquí 🔒",
        "bash: cd: no escaping this 🔒"
      ),
      sudoBlocked: localeStr(
        "este portfolio no ejecuta como root 🙅",
        "this portfolio doesn't run as root 🙅"
      ),
      rmBlocked: localeStr(
        "rm: operation not permitted (nice try) 😅",
        "rm: operation not permitted (nice try) 😅"
      ),
      notFound: localeStr(
        "comando no encontrado: {cmd}. Escribe 'help' para ver los comandos.",
        "command not found: {cmd}. Type 'help' to see commands."
      ),
      lines: {
        whoamiOut: localeStr(
          "enrique becerra — tech architect",
          "enrique becerra — tech architect"
        ),
        roleOut: localeStr(
          "arquitecto de software @ VASS",
          "software architect @ VASS"
        ),
        skillsOut: localeStr(
          "magnolia_cms, java, architecture",
          "magnolia_cms, java, architecture"
        ),
        statusOut: localeStr(
          "abierto a proyectos freelance",
          "open to freelance projects"
        ),
      },
      commands: {
        help: localeStr(
          "Comandos: whoami, cat role.txt, ./skills --top, echo $status, pwd, ls, exit, git blame",
          "Commands: whoami, cat role.txt, ./skills --top, echo $status, pwd, ls, exit, git blame"
        ),
        whoami: localeStr(
          "enrique becerra — tech architect @ VASS",
          "enrique becerra — tech architect @ VASS"
        ),
        role: localeStr(
          "arquitecto de software, formador, geek empedernido",
          "software architect, teacher, lifelong geek"
        ),
        skills: localeStr(
          "magnolia_cms [98%], java [95%], architecture [90%]",
          "magnolia_cms [98%], java [95%], architecture [90%]"
        ),
        status: localeStr(
          "abierto a proyectos freelance",
          "open to freelance projects"
        ),
        pwd: localeStr(
          "/home/enrique/universe/earth/spain/madrid",
          "/home/enrique/universe/earth/spain/madrid"
        ),
        ls: localeStr(
          "proyectos/  skills/  experiencia/  contacto/  easter_eggs/",
          "projects/  skills/  experience/  contact/  easter_eggs/"
        ),
        exit: localeStr("nice try 😏", "nice try 😏"),
        gitBlame: localeStr(
          "todo lo bueno → enrique, todo lo malo → el café",
          "all the good → enrique, all the bad → the coffee"
        ),
      },
    },
  },
  about: {
    eyebrow: localeStr("// 01. sobre mí", "// 01. about me"),
    title: localeStr("Un poco sobre mí 📖", "A bit about me 📖"),
    bio1: localeTxt(
      "Soy <strong>Tech Architect Leader</strong> con más de 8 años de experiencia, especializado en <strong>Magnolia CMS</strong>, Java y Spring. Actualmente lidero equipos técnicos en VASS y coordino el gremio <strong>VassNolia</strong> en VASS University.",
      "I'm a <strong>Tech Architect Leader</strong> with 8+ years of experience, specialized in <strong>Magnolia CMS</strong>, Java and Spring. I currently lead technical teams at VASS and coordinate the <strong>VassNolia</strong> guild at VASS University."
    ),
    bio2: localeTxt(
      "Mi trabajo abarca toma de requisitos, análisis, estimación y desarrollo end-to-end, asegurando que lo técnico encaje con lo que el cliente necesita. He diseñado plantillas y componentes escalables en Magnolia, integrado sistemas vía REST y modernizado legacy con migraciones — mayoritariamente para administración pública y grandes corporaciones.",
      "My work covers requirements, analysis, estimation and end-to-end development, making sure tech fits what the client needs. I've designed scalable Magnolia templates and components, integrated systems via REST and modernized legacy with migrations — mostly for public sector and large corporations."
    ),
    bio3: localeTxt(
      "Fuera del trabajo: geek, curioso crónico, y alguien que también sabe que hay vida más allá del teclado.",
      "Outside work: geek, chronically curious, and someone who also knows there's life beyond the keyboard."
    ),
  },
  experience: {
    eyebrow: localeStr("// 02. experiencia", "// 02. experience"),
    title: localeStr("Trayectoria 🚀", "Career 🚀"),
  },
  skills: {
    eyebrow: localeStr("// 03. skills", "// 03. skills"),
    title: localeStr("Stack técnico 💡", "Tech stack 💡"),
  },
  projects: {
    eyebrow: localeStr("// 04. proyectos", "// 04. projects"),
    title: localeStr("Proyectos propios", "Own projects"),
  },
  contact: {
    eyebrow: localeStr("// 05. contacto", "// 05. contact"),
    title: localeStr("Hablemos 💌", "Let's talk 💌"),
    description: localeTxt(
      "¿Tienes un proyecto interesante, una idea o simplemente quieres conectar? Escríbeme.",
      "Got an interesting project, an idea or just want to connect? Write to me."
    ),
  },
};

const siteSettings = {
  _id: "techSiteSettings-singleton",
  _type: "techSiteSettings",
  metadata: {
    title: localeStr(
      "Enrique Becerra — Tech Architect Lead · Magnolia CMS, Java, Next.js",
      "Enrique Becerra — Tech Architect Lead · Magnolia CMS, Java, Next.js"
    ),
    titleTemplate: "%s · ebecerra.tech",
    description: localeStr(
      "Tech Architect Lead en VASS con 8+ años de experiencia en Magnolia CMS, Java/Spring, Next.js y arquitecturas web a escala enterprise. Coordinador del gremio VassNolia.",
      "Tech Architect Lead at VASS with 8+ years of experience in Magnolia CMS, Java/Spring, Next.js and enterprise-scale web architectures. Coordinator of the VassNolia guild."
    ),
    ogDescription: localeStr(
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. 8+ años diseñando arquitecturas web para administración pública y grandes corporaciones.",
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. 8+ years designing web architectures for public sector and large corporations."
    ),
    twitterDescription: localeStr(
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. Arquitecturas web enterprise.",
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. Enterprise web architectures."
    ),
  },
  nav: {
    items: [
      { _type: "techNavItem", _key: "home", key: "home", label: localeStr("./home", "./home") },
      { _type: "techNavItem", _key: "quien_soy", key: "quien_soy", label: localeStr("./quien_soy", "./about_me") },
      { _type: "techNavItem", _key: "trayectoria", key: "trayectoria", label: localeStr("./trayectoria", "./career") },
      { _type: "techNavItem", _key: "stack", key: "stack", label: localeStr("./stack", "./stack") },
      { _type: "techNavItem", _key: "proyectos", key: "proyectos", label: localeStr("./proyectos", "./projects") },
      { _type: "techNavItem", _key: "contactar", key: "contactar", label: localeStr("./contactar", "./contact") },
    ],
  },
  footer: {
    copyrightTemplate: localeStr(
      "© {year} ebecerra.tech — hecho con ❤️ y con un poco de 🔍 y 🧪",
      "© {year} ebecerra.tech — made with ❤️ and a bit of 🔍 and 🧪"
    ),
    online: localeStr("online", "online"),
    version: "v2.0.0",
  },
};

const formStep = {
  _id: "techContactFormStep-s1",
  _type: "techContactFormStep",
  stepIndex: 1,
  title: localeStr("Hablemos", "Let's talk"),
  kind: "fields",
  fields: [
    {
      _type: "techContactField",
      _key: "f-name",
      key: "s1_name",
      type: "text",
      label: localeStr("Tu nombre", "Your name"),
      placeholder: localeStr("Tu nombre", "Your name"),
      required: true,
      columns: 1,
      autoComplete: "name",
    },
    {
      _type: "techContactField",
      _key: "f-email",
      key: "s1_email",
      type: "email",
      label: localeStr("Email", "Email"),
      placeholder: localeStr("tu@email.com", "you@email.com"),
      required: true,
      columns: 1,
      autoComplete: "email",
    },
    {
      _type: "techContactField",
      _key: "f-message",
      key: "s1_message",
      type: "textarea",
      label: localeStr("Mensaje", "Message"),
      placeholder: localeStr("Cuéntame...", "Tell me..."),
      required: true,
      columns: 1,
    },
  ],
};

const formSettings = {
  _id: "techContactFormSettings-singleton",
  _type: "techContactFormSettings",
  steps: [
    { _type: "reference", _key: "step-s1", _ref: "techContactFormStep-s1" },
  ],
  submitLabel: localeStr("$ enviar_mensaje →", "$ send_message →"),
  sendingLabel: localeStr("Enviando...", "Sending..."),
  gdprLabel: localeStr(
    "Al enviar este formulario aceptas la política de privacidad. Tus datos solo se usan para responderte.",
    "By submitting you accept the privacy policy. Your data is only used to reply."
  ),
  honeypotLabel: localeStr("Website (no rellenar)", "Website (do not fill)"),
  successMessage: localeStr(
    "Mensaje enviado correctamente. ¡Gracias!",
    "Message sent successfully. Thanks!"
  ),
  errorMessage: localeStr(
    "Error al enviar el mensaje. Inténtalo de nuevo.",
    "Failed to send the message. Try again."
  ),
  missingRequiredMessage: localeStr(
    "Faltan campos obligatorios.",
    "Some required fields are missing."
  ),
};

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN env var.");
    process.exit(1);
  }
  console.log(`Mode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
  if (!COMMIT) {
    console.log("Would write 4 docs:");
    console.log(" -", homeSections._id);
    console.log(" -", siteSettings._id);
    console.log(" -", formStep._id);
    console.log(" -", formSettings._id);
    return;
  }
  console.log("Writing techHomeSections...");
  await client.createOrReplace(homeSections);
  console.log("Writing techSiteSettings...");
  await client.createOrReplace(siteSettings);
  console.log("Writing techContactFormStep-s1...");
  await client.createOrReplace(formStep);
  console.log("Writing techContactFormSettings...");
  await client.createOrReplace(formSettings);
  console.log("\nDone. Tech seeded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
