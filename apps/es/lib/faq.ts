import type { Locale } from "@/i18n/routing";

export type FaqItem = { q: string; a: string };

// Fallback estático para /faq cuando Sanity está vacío o caído.
// Mantener en sync con los faqItem publicados en el workspace ebecerra-web.
const es: FaqItem[] = [
  {
    q: "¿Cuál es la diferencia entre Landing, Portfolio, Web y Tienda?",
    a: "Todos funcionan igual: un alta única + el mantenimiento (hosting, actualizaciones y soporte), que se factura una vez al año con los 3 primeros meses gratis. Precios con IVA incluido. Landing (450 € de alta + 22 €/mes) es una página con un objetivo claro —que te llamen o escriban—, ideal para autónomos que quieren estar online rápido. Portfolio (590 € + 29 €/mes) es una web multipágina para enseñar tu obra, pensada para creativos: arquitectos, fotógrafos, ilustradores. Web (790 € + 69 €/mes) es tu web completa con varias secciones, blog y un panel para que edites tú los textos y las fotos sin depender de mí. Tienda (1.190 € + 119 €/mes) es un ecommerce completo —catálogo, carrito, pedidos y pasarela de pago—, sin comisión por venta.",
  },
  {
    q: "¿Cuánto tarda un proyecto web?",
    a: "Depende del plan. Landing y Portfolio se entregan en 1-2 semanas. Web en 3-4 semanas. Tienda en 4-6 semanas. Un rescate de una web antigua (proyecto a medida fuera de catálogo) puede ir a 2-3 meses según lo que haya que mover y reescribir. En la primera conversación te doy un plazo concreto con hitos semanales, no un rango vago.",
  },
  {
    q: "¿Cómo se paga un proyecto?",
    a: "Dos formas. Lo habitual: un alta al arrancar el proyecto y el mantenimiento, que se factura una vez al año por adelantado, con los 3 primeros meses gratis. Sin permanencia. Si prefieres que la web sea tuya de una vez, en Landing, Portfolio y Web hay pago único (código y dominio 100% tuyos + 3 meses de soporte); solo la Tienda va exclusivamente con mantenimiento anual, porque su motor necesita hosting continuo. En proyectos a medida largos (rescates de webs antiguas, intranets) trabajamos por hitos acordados. Todo por transferencia, con IVA incluido en el precio mostrado.",
  },
  {
    q: "¿Qué pasa si no me gusta el diseño?",
    a: "Cada propuesta incluye 2 rondas de revisión antes de picar código. Trabajo con maquetas navegables, no con imágenes estáticas — las ves y las pruebas en tu móvil. Si aun así hay que cambiar de rumbo antes de desarrollar, no hay sobrecoste: para eso están esas rondas.",
  },
  {
    q: "¿Tengo que aportar yo los textos y las fotos?",
    a: "Sí, el contenido real (textos, fotos de tu equipo, logos, catálogo) lo aportas tú: nadie conoce tu negocio mejor. Si necesitas ayuda con la redacción o con fotografía profesional, te recomiendo colaboradores de confianza — pero no lo subcontrato dentro del presupuesto salvo que lo pidas.",
  },
  {
    q: "¿Quién mantiene la web después de entregarla?",
    a: "Yo, siempre. El mantenimiento —hosting, copias, seguridad, actualizaciones y soporte— va incluido en la cuota mensual mientras seas cliente. No hay una 'fase de soporte' que caduque: mientras pagas la cuota me encargo de que tu web siga funcionando y hago los cambios que entren en tu plan cada mes.",
  },
  {
    q: "¿Tengo que firmar permanencia? ¿La web acaba siendo mía?",
    a: "No hay permanencia: te das de baja cuando quieras, sin penalización. Tu web vive en mi infraestructura y yo me encargo de todo mientras seas cliente. La única regla es la propiedad del código: si te das de baja antes de los 12 meses, la web se apaga y el código se queda conmigo (el alta pagó construirla, no cederla); a partir de los 12 meses, si decides seguir por tu cuenta, te entrego el código para que lo alojes donde quieras. El dominio es tuyo desde el primer día. Todo esto te lo explico antes de firmar, nunca en letra pequeña.",
  },
  {
    q: "¿Tu web entra en el Kit Digital?",
    a: "A día de hoy (2026), las convocatorias del programa Kit Digital están cerradas según la página oficial (acelerapyme.gob.es). Para que un cliente pueda usar el bono con un desarrollador, éste tiene que ser Agente Digitalizador Adherido registrado en red.es — figura que hoy no tengo dada de alta. Si tu caso depende de esa ayuda, te lo digo claro antes de presupuestar y buscamos una alternativa honesta.",
  },
  {
    q: "¿Firmas acuerdos de confidencialidad (NDA)?",
    a: "Sí, sin problema. En proyectos donde se maneja información sensible o estratégica firmo NDA antes de la primera reunión técnica. En proyectos menores basta con las cláusulas de confidencialidad del contrato de servicios.",
  },
  {
    q: "¿De quién son el dominio y las cuentas de hosting?",
    a: "El dominio es siempre tuyo, desde el día 1, registrado a tu nombre. Si llegas con uno, ni lo toco. Si lo damos de alta nuevo, va directamente a tu nombre y yo solo figuro como administrador técnico. Las cuentas técnicas (hosting en Vercel, CMS Sanity, base de datos, monitorización) se gestionan desde mi cuenta mientras dura el servicio, porque me permite desplegar, dar soporte y monitorizar sin fricciones. El código fuente sigue el modelo de propiedad: se queda conmigo mientras seas cliente y pasa a ser tuyo a partir de los 12 meses (o antes si lo acordamos por escrito). Si entonces decides gestionar la web por tu cuenta, te transfiero las cuentas o te entrego las credenciales para que asumas la gestión.",
  },
];

const en: FaqItem[] = [
  {
    q: "What's the difference between Landing, Portfolio, Web and Store?",
    a: "They all work the same way: a one-off setup + maintenance (hosting, updates and support) billed once a year, with the first 3 months free. Prices include VAT. Landing (€450 setup + €22/mo) is a single page with a clear goal —get people to call or message you—, ideal for freelancers who want to be online fast. Portfolio (€590 + €29/mo) is a multi-page site to showcase your work, made for creatives: architects, photographers, illustrators. Web (€790 + €69/mo) is your full website with multiple sections, a blog and a CMS panel so you edit the text and photos yourself without depending on me. Store (€1,190 + €119/mo) is a full ecommerce —catalog, cart, orders and payment gateway—, with no sales commission.",
  },
  {
    q: "How long does a web project take?",
    a: "Depends on the plan. Landing and Portfolio ship in 1-2 weeks. Web in 3-4 weeks. Store in 4-6 weeks. Rescuing an old site (custom project off-catalogue) can take 2-3 months depending on what needs to be moved and rewritten. In the first conversation I give you a concrete timeline with weekly milestones, not a vague range.",
  },
  {
    q: "How is a project paid?",
    a: "Two ways. Usually: a setup at kick-off and maintenance, billed once a year in advance with the first 3 months free. No lock-in. If you'd rather own the site outright, Landing, Portfolio and Web have a one-time option (code and domain 100% yours + 3 months of support); only the Store is annual-maintenance only, since its engine needs continuous hosting. For long custom projects (legacy rescues, intranets) we work by agreed milestones. Everything by bank transfer, VAT included in the prices shown.",
  },
  {
    q: "What if I don't like the design?",
    a: "Each proposal includes 2 revision rounds before writing code. I work with navigable prototypes, not static images — you see them and try them on your phone. If we need to pivot direction before development starts, there's no extra cost: that's what those rounds are for.",
  },
  {
    q: "Do I have to provide the text and photos myself?",
    a: "Yes, the real content (copy, team photos, logos, catalog) is yours to provide: no one knows your business better. If you need help with copywriting or professional photography, I can recommend trusted collaborators — but it isn't subcontracted inside the quote unless you ask for it.",
  },
  {
    q: "Who maintains the website after delivery?",
    a: "I do, always. Maintenance —hosting, backups, security, updates and support— is included in the monthly fee for as long as you're a client. There's no 'support phase' that expires: while you pay the fee I keep your site running and make the changes your plan covers each month.",
  },
  {
    q: "Do I have to sign a lock-in contract? Do I end up owning the website?",
    a: "There's no lock-in: you can cancel whenever you want, with no penalty. Your site lives on my infrastructure and I handle everything while you're a client. The only rule is code ownership: if you cancel before 12 months, the site is switched off and the code stays with me (the setup fee paid to build it, not to hand it over); from 12 months onward, if you decide to go your own way, I hand over the code so you can host it wherever you like. The domain is yours from day one. I explain all of this before signing, never in fine print.",
  },
  {
    q: "Does your work qualify for Spain's Kit Digital grant?",
    a: "As of 2026, the Kit Digital program calls are closed according to the official site (acelerapyme.gob.es). For a client to use the grant with a developer, the developer must be an Adhered Digitizer Agent registered with red.es — a status I currently don't hold. If your case depends on this grant, I'll tell you upfront and we'll look for an honest alternative.",
  },
  {
    q: "Do you sign NDAs?",
    a: "Yes, no problem. For projects handling sensitive or strategic information, I sign an NDA before the first technical meeting. For smaller projects, the confidentiality clauses in the services contract are enough.",
  },
  {
    q: "Who owns the domain and hosting accounts?",
    a: "The domain is always yours, from day 1, registered in your name. If you already have one, I don't touch it. If we register a new one, it goes directly in your name and I only appear as technical administrator. Technical accounts (Vercel hosting, Sanity CMS, database, monitoring) are managed from my account while the service lasts, because that lets me deploy, support and monitor without friction. The source code follows the ownership model: it stays with me while you're a client and becomes yours from 12 months onward (or earlier if we agree in writing). If you then decide to manage the site yourself, I transfer the accounts or hand over the credentials so you can take over.",
  },
];

export function getFaq(locale: Locale): FaqItem[] {
  return locale === "en" ? en : es;
}
