import type { Locale } from "@/i18n/routing";

export type FaqItem = { q: string; a: string };

// Fallback estático para /faq cuando Sanity está vacío o caído.
// Mantener en sync con los faqItem publicados en el workspace ebecerra-web.
const es: FaqItem[] = [
  {
    q: "¿Cuál es la diferencia entre los tiers Landing, Profesional y Avanzado?",
    a: "Landing es una página única con un CTA claro (formulario o WhatsApp): ideal para autónomos que quieren estar online rápido y captar contactos sin invertir mucho. Profesional añade web a medida con más secciones, un CMS propio para que tu equipo publique sin llamarme, formación de uso y FAQ marcado para Google. Avanzado incluye además sistema de reservas online sincronizado con Google Calendar (o Doctoralia) y un add-on a elegir (chatbot, pagos, etc.). En el camino Compra directa los precios son 399 / 1.500 / 2.000 €; en Contrato de servicio son 199 / 699 / 999 € de alta + 19 / 69 / 89 €/mes.",
  },
  {
    q: "¿Cuánto tarda un proyecto web?",
    a: "Depende del tier. Landing se entrega en 1-2 semanas. Profesional y Avanzado en 4-6 semanas. Un rescate de una web antigua (proyecto a medida fuera de catálogo) puede ir a 2-3 meses según lo que haya que mover y reescribir. En la primera conversación te doy un plazo concreto con hitos semanales, no un rango vago.",
  },
  {
    q: "¿Cómo se paga un proyecto?",
    a: "En Compra directa: 50 % al firmar el presupuesto (reserva de calendario y arranque) y 50 % a la entrega en producción. En Contrato de servicio: pago de alta (199 / 699 / 999 €) al firmar y cuota mensual (19 / 69 / 89 €) facturada al inicio de cada mes, con permanencia mínima de 12 meses. En proyectos a medida largos (rescates de webs antiguas, intranets): 30 / 40 / 30 con hitos acordados. Todo por transferencia, con factura e IVA incluido en el precio mostrado.",
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
    a: "Si has elegido Compra directa, tu web es 100 % tuya desde el día 1. Landing incluye 1 mes de soporte post-entrega; Profesional y Avanzado, 3 meses. Después puedes contratar mantenimiento opcional aparte (29 / 69 / 89 €/mes según el tier) o gestionarla por tu cuenta. Si has elegido Contrato de servicio, el mantenimiento ya va incluido en la cuota mensual durante toda la vigencia del contrato (mínimo 12 meses).",
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
    a: "El dominio es siempre tuyo, desde el día 1, registrado a tu nombre. Si llegas con uno, ni lo toco. Si lo damos de alta nuevo, va directamente a tu nombre y yo solo figuro como administrador técnico. Las cuentas técnicas (hosting en Vercel, CMS Sanity, base de datos, monitorización) se gestionan desde mi cuenta mientras dura el servicio, porque me permite desplegar, dar soporte y monitorizar sin fricciones. Cuando termina la relación, te transfiero esas cuentas o te entrego las credenciales para que asumas la gestión. El código fuente, si has elegido Compra directa, es tuyo desde el día 1; si has elegido Contrato de servicio, te lo entrego al terminar el contrato o antes si lo pides por escrito.",
  },
];

const en: FaqItem[] = [
  {
    q: "What's the difference between Landing, Professional and Advanced tiers?",
    a: "Landing is a single page with a clear CTA (form or WhatsApp): ideal for freelancers who want to be online fast and capture leads without investing much. Professional adds a custom multi-section website with a CMS so your team can publish without calling me, usage training and a Google-ready FAQ. Advanced also includes an online booking system synced with Google Calendar (or Doctoralia) and one add-on of your choice (chatbot, payments, etc.). In the Direct purchase path prices are €399 / €1,500 / €2,000; in Service contract they are €199 / €699 / €999 setup + €19 / €69 / €89/mo.",
  },
  {
    q: "How long does a web project take?",
    a: "Depends on the tier. Landing ships in 1-2 weeks. Professional and Advanced in 4-6 weeks. Rescuing an old site (custom project off-catalogue) can take 2-3 months depending on what needs to be moved and rewritten. In the first conversation I give you a concrete timeline with weekly milestones, not a vague range.",
  },
  {
    q: "How is a project paid?",
    a: "Direct purchase: 50% on quote acceptance (calendar reservation and kick-off) and 50% on production delivery. Service contract: setup payment (€199 / €699 / €999) on signing plus monthly fee (€19 / €69 / €89) invoiced at the start of each month, with a 12-month minimum term. Custom long projects (legacy rescues, intranets): 30 / 40 / 30 with agreed milestones. Everything by bank transfer, with an invoice — VAT is included in the prices shown.",
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
    a: "If you chose Direct purchase, your site is 100% yours from day 1. Landing includes 1 month of post-delivery support; Professional and Advanced, 3 months. After that you can contract optional maintenance separately (€29 / €69 / €89/mo by tier) or manage it yourself. If you chose Service contract, maintenance is already included in the monthly fee for the entire contract duration (12-month minimum).",
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
    a: "The domain is always yours, from day 1, registered in your name. If you already have one, I don't touch it. If we register a new one, it goes directly in your name and I only appear as technical administrator. Technical accounts (Vercel hosting, Sanity CMS, database, monitoring) are managed from my account while the service lasts, because that lets me deploy, support and monitor without friction. When the relationship ends, I transfer those accounts to you or hand over the credentials so you can take over. Source code, if you chose Direct purchase, is yours from day 1; if you chose Service contract, I hand it over when the contract ends or earlier on written request.",
  },
];

export function getFaq(locale: Locale): FaqItem[] {
  return locale === "en" ? en : es;
}
