import type { Locale } from "@/i18n/routing";

export type FaqItem = { q: string; a: string };

const es: FaqItem[] = [
  {
    q: "¿Cuál es la diferencia entre la web de 900 € y la de 1.500 €?",
    a: "La web profesional (900 €) está pensada para negocios que necesitan presencia online limpia y rápida pero no van a actualizarla a menudo: clínicas, despachos, estudios, servicios locales. La hago a medida y tú me pides cambios puntuales cuando toque. La web editable (1.500 €) añade un CMS profesional encima para que tu equipo publique noticias, casos, novedades o fichas sin llamarme. Si vas a tocar contenido más de una vez al trimestre, la editable se amortiza en pocos meses.",
  },
  {
    q: "¿Cuánto tarda un proyecto web?",
    a: "Depende del servicio. Una web de presencia (900 €) se entrega en 2-3 semanas. Una web editable con CMS (1.500 €) en 4-6 semanas. Un rescate de una web antigua puede ir a 2-3 meses según lo que haya que mover y reescribir. En la primera conversación te doy un plazo concreto con hitos semanales, no un rango vago.",
  },
  {
    q: "¿Cómo se paga un proyecto?",
    a: "30 % al firmar el presupuesto (reserva de calendario y arranque), 40 % al alcanzar el hito intermedio acordado y 30 % a la entrega en producción. Facturas con IVA y sin adelantos del 100 %. El mantenimiento mensual (60 €/mes) se factura aparte, sin permanencia: te das de baja cuando quieras. Todo por transferencia.",
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
    a: "Depende de lo que prefieras. Si contratas la web editable (1.500 €), tu equipo publica y actualiza sin llamarme: incluyo formación y 3 meses de soporte técnico tras la entrega. Si no quieres preocuparte por nada, está el plan de mantenimiento mensual (60 €/mes): alojamiento, copias de seguridad, pequeños cambios y alguien a quien llamar cuando algo no funciona. Sin permanencia, bajas cuando quieras.",
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
    q: "¿Te encargas del hosting y del dominio?",
    a: "Puedo gestionar la contratación técnica y el despliegue en Vercel, Netlify o similar, con recomendación adaptada al caso. El dominio y el hosting se contratan siempre a tu nombre: tú eres el propietario, nunca yo. Así no dependes de mí para nada operativo.",
  },
];

const en: FaqItem[] = [
  {
    q: "What's the difference between the €900 site and the €1,500 one?",
    a: "The professional website (€900) is designed for businesses that need clean, fast online presence but won't update it often: clinics, law firms, studios, local services. I build it custom and you reach out when you need a change. The editable website (€1,500) adds a professional CMS on top so your team can publish news, cases, updates or product pages without calling me. If you'll touch content more than once a quarter, the editable one pays for itself in a few months.",
  },
  {
    q: "How long does a web project take?",
    a: "It depends on the service. A presence site (€900) ships in 2-3 weeks. An editable site with a CMS (€1,500) in 4-6 weeks. A rescue of a legacy site can go to 2-3 months depending on what needs to be moved and rewritten. On our first call I give you a concrete timeline with weekly milestones, not a vague range.",
  },
  {
    q: "How do payments work?",
    a: "30% on signing the quote (schedule reserved, work starts), 40% on the agreed mid-project milestone and 30% on live delivery. Invoices include VAT and there are no 100% upfront payments. Monthly maintenance (€60/month) is billed separately, no lock-in, cancel whenever you want. All by bank transfer.",
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
    q: "Who maintains the site after delivery?",
    a: "It depends on what you prefer. If you pick the editable site (€1,500), your team publishes and updates without calling me: I include training and 3 months of technical support after delivery. If you'd rather not worry about anything, there's the monthly maintenance plan (€60/month): hosting, backups, small changes and someone to call when something breaks. No lock-in, cancel whenever you want.",
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
    q: "Do you handle hosting and domain?",
    a: "I can handle the technical setup and deployment on Vercel, Netlify or similar, with a recommendation adapted to your case. The domain and hosting are always contracted under your name: you own them, never me. That way you don't depend on me for anything operational.",
  },
];

export function getFaq(locale: Locale): FaqItem[] {
  return locale === "en" ? en : es;
}
