// Siembra el singleton aboutPage (página /sobre-mi) con contenido ES+EN.
// Tono personal/vivencia, sin jerga técnica. Idempotente (createOrReplace).
//
// Uso desde apps/es:
//   node --env-file=.env.local scripts/seed-about-page-2026-05-31.mjs           (dry run)
//   node --env-file=.env.local scripts/seed-about-page-2026-05-31.mjs --commit
import { createClient } from "@sanity/client";

const COMMIT = process.argv.includes("--commit");

const client = createClient({
  projectId: "gdtxcn4l",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const ls = (es, en) => ({ _type: "localeString", es, en });
const lt = (es, en) => ({ _type: "localeText", es, en });
const para = (key, es, en) => ({ _type: "para", _key: key, text: lt(es, en) });
const pillar = (key, tEs, tEn, bEs, bEn) => ({
  _type: "pillar",
  _key: key,
  title: ls(tEs, tEn),
  body: lt(bEs, bEn),
});

const doc = {
  _id: "aboutPage-singleton",
  _type: "aboutPage",
  metaTitle: ls(
    "Sobre mí — Enrique Becerra, desarrollo web para negocios pequeños",
    "About me — Enrique Becerra, web development for small businesses"
  ),
  metaDescription: lt(
    "Más de 8 años haciendo webs para grandes empresas, ahora al servicio de autónomos y PYMEs. Webs a medida, fáciles de mantener y con personalidad — nada de plantillas.",
    "8+ years building websites for large companies, now at the service of freelancers and small businesses. Custom, easy-to-maintain sites with personality — no templates."
  ),
  kicker: ls("Sobre mí", "About me"),
  title: ls("Hola, soy Enrique Becerra", "Hi, I'm Enrique Becerra"),
  lead: lt(
    "Llevo más de 8 años haciendo webs para grandes empresas. Ahora ayudo a negocios pequeños a tener una web que de verdad sea suya — hecha a medida, no sacada de una plantilla.",
    "For 8+ years I've built websites for large companies. Now I help small businesses get a site that's truly theirs — custom-made, not pulled from a template."
  ),
  intro: [
    para(
      "p1",
      "Durante más de ocho años me he dedicado a crear y mantener webs para grandes empresas: sitios que reciben miles de visitas al día y que no se pueden permitir fallar. Ahí aprendí a hacer las cosas con cuidado, a pensar antes de tocar y a dejarlo todo de forma que cualquiera pueda seguir trabajando sin que nada se rompa.",
      "For more than eight years I've built and maintained websites for large companies: sites that get thousands of visits a day and can't afford to fail. That's where I learned to do things carefully, to think before touching anything, and to leave everything so anyone can keep working without breaking it."
    ),
    para(
      "p2",
      "En algún momento me di cuenta de que ese mismo cuidado es justo lo que le falta a la mayoría de webs de negocios pequeños. Y de ahí nació esta aventura por mi cuenta: coger todo lo que he aprendido en el mundo empresarial y ponerlo al servicio de autónomos y PYMEs, de tú a tú, sin intermediarios ni comerciales por medio.",
      "At some point I realised that this same care is exactly what most small-business websites are missing. And that's how this solo adventure started: taking everything I've learned in the corporate world and putting it at the service of freelancers and small businesses — one to one, no middlemen or salespeople in between."
    ),
    para(
      "p3",
      "Mi forma de trabajar parte de una idea sencilla: la web se adapta a tu negocio, no al revés. En los últimos años se ha abusado tanto de las plantillas que media internet parece la misma página repintada. Yo prefiero empezar de cero y entender cómo funciona lo tuyo, para que el resultado tenga personalidad y te represente de verdad.",
      "The way I work comes from a simple idea: the website adapts to your business, not the other way around. Templates have been so overused lately that half the internet looks like the same page repainted. I'd rather start from scratch and understand how your business actually works, so the result has personality and truly represents you."
    ),
  ],
  pillarsTitle: ls("Cómo trabajo", "How I work"),
  pillars: [
    pillar(
      "pl1",
      "Hecho a medida, desde cero",
      "Custom-made, from scratch",
      "Nada de plantillas que se repiten en miles de webs. Entiendo tu negocio y construyo algo que solo encaja contigo: tu tono, tu manera de trabajar, tus clientes.",
      "No templates repeated across thousands of sites. I understand your business and build something that only fits you: your tone, your way of working, your customers."
    ),
    pillar(
      "pl2",
      "Fácil de mantener, sin atarte a mí",
      "Easy to maintain, no strings to me",
      "Te entrego una web que puedes actualizar tú, sin llamarme cada vez que cambia un texto. Y si algún día quieres seguir por tu cuenta, todo es tuyo.",
      "I hand you a website you can update yourself, without calling me every time a line of text changes. And if one day you want to carry on alone, it's all yours."
    ),
    pillar(
      "pl3",
      "La IA acelera, el oficio decide",
      "AI speeds things up; craft makes the call",
      "La inteligencia artificial ha avanzado muchísimo y es tentador pedirle que te haga la web entera. Pero sin saber lo que estás montando acabas con un sitio difícil de mantener y sin alma. Yo me apoyo en la IA para ir más rápido, pero quien decide y da el acabado soy yo: por eso el resultado funciona, atrae clientes y dura.",
      "AI has come a long way and it's tempting to ask it to build your whole website. But without knowing what you're putting together you end up with a site that's hard to maintain and has no soul. I lean on AI to go faster, but I'm the one who decides and gives it the finish — that's why the result works, attracts customers and lasts."
    ),
  ],
  closingTitle: ls("¿Hablamos de la tuya?", "Shall we talk about yours?"),
  closingBody: lt(
    "Si quieres una web hecha a tu medida, fácil de mantener y que de verdad te represente, cuéntame tu proyecto. La primera conversación es de 30 minutos y sin compromiso.",
    "If you want a website made to measure, easy to maintain and that truly represents you, tell me about your project. The first conversation is 30 minutes, no commitment."
  ),
  closingCtaLabel: ls("Hablemos", "Let's talk"),
};

console.log(`\nMode: ${COMMIT ? "COMMIT" : "DRY RUN"}`);
console.log(`Doc: ${doc._id} (${doc._type})`);
console.log(`  intro: ${doc.intro.length} párrafos · pillars: ${doc.pillars.length}`);

if (!COMMIT) {
  console.log("\n(dry run — re-run with --commit)\n");
  process.exit(0);
}

await client.createOrReplace(doc);
console.log("\n  ✓ aboutPage-singleton creado/actualizado\n");
