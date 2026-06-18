/* ==========================================================================
   Plantilla Gestoría — contenido (negocio FICTICIO, todo placeholder editable)
   --------------------------------------------------------------------------
   Demo de captación: NO es cliente editable, por eso el copy vive aquí y no en
   Sanity (el schema demoSite no modela timeline/cuenta atrás/subpáginas/FAQ por
   área). TODO dato sensible — nº de colegiado, sellos, cifras, testimonios,
   datos fiscales — es un PLACEHOLDER claramente sustituible por los reales de la
   gestoría que adopte la web. No se atribuyen credenciales reales a un negocio
   ficticio. Teléfono/WhatsApp/email anonimizados (patrón de las demos).
   Bilingüe ES + EN.
   ========================================================================== */

import type { Locale } from "@/i18n/routing";

export type ServiceSlug = "autonomos" | "herencias" | "extranjeria";
export const SERVICE_SLUGS: ServiceSlug[] = [
  "autonomos",
  "herencias",
  "extranjeria",
];

type Link = { label: string; href: string };
type IconKey =
  | "fiscal"
  | "laboral"
  | "contable"
  | "mercantil"
  | "autonomo"
  | "empresa"
  | "herencia"
  | "extranjeria"
  | "trafico"
  | "shield"
  | "clock"
  | "doc"
  | "check";

export type ServiceDetail = {
  slug: ServiceSlug;
  kicker: string;
  title: string;
  lead: string;
  intro: string;
  included: { title: string; items: { name: string; desc: string }[] };
  forWho: { title: string; body: string; items: string[] };
  process: { title: string; lead: string; steps: { title: string; body: string }[] };
  faq: { title: string; items: { q: string; a: string }[] };
  cta: { title: string; body: string };
};

export type GestoriaContent = {
  locale: Locale;
  brand: {
    name: string;
    short: string;
    monogram: string;
    legalName: string;
    cif: string;
    foundedYear: number;
    colegiado: string;
  };
  phone: { display: string; tel: string };
  whatsapp: { display: string; href: string };
  email: string;
  nav: {
    skip: string;
    primaryNav: string;
    openMenu: string;
    closeMenu: string;
    servicesLabel: string;
    links: Link[];
    serviceLinks: (Link & { soon?: boolean })[];
    ctaLabel: string;
    callLabel: string;
    waLabel: string;
  };
  hero: {
    kicker: string;
    headingLead: string;
    headingAccent: string;
    headingTail: string;
    sub: string;
    sello: { label: string; number: string; note: string };
    ctaPrimary: string;
    ctaSecondary: string;
    chaosNote: string;
    orderNote: string;
    scrollHint: string;
    pauseAnim: string;
    playAnim: string;
  };
  countdown: {
    label: string;
    daysWord: string;
    dayWord: string;
    todayLabel: string;
    nextLabel: string;
    aria: string;
    deadlines: { md: string; label: string }[];
  };
  trust: { srLabel: string; items: string[] };
  services: {
    kicker: string;
    title: string;
    lead: string;
    areasTitle: string;
    areas: { icon: IconKey; title: string; problem: string }[];
    pathsTitle: string;
    pathsLead: string;
    paths: {
      icon: IconKey;
      title: string;
      problem: string;
      href: string | null;
      soon?: boolean;
      cta: string;
    }[];
    digitalTitle: string;
    digitalBody: string;
    digitalBullets: string[];
  };
  process: {
    kicker: string;
    title: string;
    lead: string;
    steps: { title: string; body: string }[];
    footnote: string;
  };
  team: {
    kicker: string;
    title: string;
    lead: string;
    members: { name: string; role: string; area: string; note: string }[];
    photoNote: string;
  };
  stats: {
    kicker: string;
    title: string;
    lead: string;
    items: { value: number; prefix: string; suffix: string; label: string; emphasis?: boolean }[];
    note: string;
  };
  testimonials: {
    kicker: string;
    title: string;
    google: { rating: string; count: string; label: string };
    items: { quote: string; author: string; context: string }[];
    sectorsTitle: string;
    sectors: string[];
  };
  faq: {
    kicker: string;
    title: string;
    lead: string;
    items: { q: string; a: string }[];
  };
  contact: {
    kicker: string;
    title: string;
    lead: string;
    callTitle: string;
    callLabel: string;
    waLabel: string;
    emailLabel: string;
    addressTitle: string;
    address: string[];
    hoursTitle: string;
    hours: { label: string; value: string }[];
    remoteNote: string;
    mapLabel: string;
    confidentiality: string;
    form: {
      title: string;
      lead: string;
      name: string;
      namePh: string;
      phone: string;
      phonePh: string;
      need: string;
      needPh: string;
      needOptions: string[];
      message: string;
      messagePh: string;
      consent: string;
      consentLink: string;
      submit: string;
      sending: string;
      successTitle: string;
      successBody: string;
      required: string;
    };
  };
  close: {
    kicker: string;
    heading: string;
    body: string;
    statusLabel: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    tagline: string;
    navTitle: string;
    servicesTitle: string;
    legalTitle: string;
    legalLinks: Link[];
    fiscalTitle: string;
    fiscalLines: string[];
    colegiadoLine: string;
    confidentiality: string;
    copyright: string;
    demoNote: string;
    backToTop: string;
  };
  cookies: { text: string; accept: string; reject: string; link: string };
  servicePage: {
    breadcrumbHome: string;
    includedDefault: string;
    backTitle: string;
    backLead: string;
    others: (Link & { soon?: boolean })[];
  };
  services_detail: Record<ServiceSlug, ServiceDetail>;
};

/* ----------------------------- Datos comunes ----------------------------- */
const PHONE = { display: "+34 600 00 00 00", tel: "+34600000000" };
const WHATSAPP = { display: "WhatsApp", href: "https://wa.me/34600000000" };
const EMAIL = "hola@vega-asociados.es";
const BRAND = {
  name: "Vega & Asociados",
  short: "Vega & Asociados",
  monogram: "V",
  legalName: "Vega & Asociados Gestoría, S.L. (nombre ficticio · demo)",
  cif: "B00000000",
  foundedYear: 1998,
  colegiado: "0000",
};

/* ============================== ESPAÑOL ================================== */
const ES: GestoriaContent = {
  locale: "es",
  brand: BRAND,
  phone: PHONE,
  whatsapp: WHATSAPP,
  email: EMAIL,
  nav: {
    skip: "Saltar al contenido",
    primaryNav: "Navegación principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    servicesLabel: "Servicios",
    links: [
      { label: "Servicios", href: "#servicios" },
      { label: "Cómo trabajamos", href: "#proceso" },
      { label: "Equipo", href: "#equipo" },
      { label: "Preguntas", href: "#faq" },
      { label: "Contacto", href: "#contacto" },
    ],
    serviceLinks: [
      { label: "Autónomos", href: "/vega-asociados/autonomos" },
      { label: "Herencias y sucesiones", href: "/vega-asociados/herencias" },
      { label: "Extranjería", href: "/vega-asociados/extranjeria" },
      { label: "Empresas y pymes", href: "#servicios", soon: true },
      { label: "Tráfico", href: "#servicios", soon: true },
    ],
    ctaLabel: "Primera consulta gratis",
    callLabel: "Llamar",
    waLabel: "WhatsApp",
  },
  hero: {
    kicker: "Gestoría y asesoría · desde 1998",
    headingLead: "Tus impuestos en orden,",
    headingAccent: "y tú",
    headingTail: "durmiendo tranquilo.",
    sub: "Llevamos el papeleo, los plazos y Hacienda por ti. Tú dedícate a lo tuyo, que de lo demás nos encargamos nosotros.",
    sello: {
      label: "Gestor colegiado",
      number: "Nº 0000",
      note: "Sello de ejemplo · sustituir por el colegiado real",
    },
    ctaPrimary: "Primera consulta sin compromiso",
    ctaSecondary: "Escríbenos por WhatsApp",
    chaosNote: "Tus papeles, hoy",
    orderNote: "Tus papeles en su sitio y al día",
    scrollHint: "Baja y te lo contamos",
    pauseAnim: "Pausar animación",
    playAnim: "Reanudar animación",
  },
  countdown: {
    label: "Próximo vencimiento fiscal",
    daysWord: "días",
    dayWord: "día",
    todayLabel: "es hoy",
    nextLabel: "para",
    aria: "Cuenta atrás hasta el próximo vencimiento fiscal",
    deadlines: [
      { md: "01-20", label: "IVA y retenciones del 4º trimestre" },
      { md: "01-30", label: "Resumen anual de IVA (mod. 390)" },
      { md: "04-20", label: "IVA e IRPF del 1er trimestre" },
      { md: "06-30", label: "Declaración de la Renta" },
      { md: "07-20", label: "IVA e IRPF del 2º trimestre" },
      { md: "07-25", label: "Impuesto de Sociedades (mod. 200)" },
      { md: "10-20", label: "IVA e IRPF del 3er trimestre" },
    ],
  },
  trust: {
    srLabel: "Habilitaciones y credenciales (ejemplos de la demo)",
    items: [
      "Gestor colegiado · ICOGA",
      "Colaborador social de la AEAT",
      "Autorizado RED · Seguridad Social",
      "Punto PAE / CIRCE",
      "Colegio de Economistas · REAF",
      "Graduado Social colegiado",
      "Firma electrónica y portal del cliente",
      "Datos cifrados y confidenciales",
    ],
  },
  services: {
    kicker: "Lo que hacemos",
    title: "Todo el papeleo, en un solo sitio",
    lead: "Cuatro áreas que cubren la vida fiscal de un autónomo o una empresa. Sin jerga: te lo explicamos como lo entiendes tú.",
    areasTitle: "Nuestras áreas",
    areas: [
      {
        icon: "fiscal",
        title: "Fiscal",
        problem: "Presentamos tus impuestos (IRPF, IVA, Sociedades) a tiempo y bien, para que no te juegues una sanción.",
      },
      {
        icon: "laboral",
        title: "Laboral",
        problem: "Nóminas, contratos y Seguridad Social al día, sin que tengas que estar pendiente de cada plazo.",
      },
      {
        icon: "contable",
        title: "Contable",
        problem: "Llevamos tus libros y tus cuentas anuales con el mismo orden con el que querrías llevar tu negocio.",
      },
      {
        icon: "mercantil",
        title: "Mercantil y jurídico",
        problem: "Constituir tu SL, una herencia o un contrato: el papeleo legal resuelto con quien sabe del tema.",
      },
    ],
    pathsTitle: "¿Y tú, qué necesitas?",
    pathsLead: "Cada situación tiene su página, con lo que incluye y cómo lo hacemos.",
    paths: [
      {
        icon: "autonomo",
        title: "Autónomos",
        problem: "Del alta en el 036 al trimestre y la renta. Te llevamos todo y te avisamos antes de cada plazo.",
        href: "/vega-asociados/autonomos",
        cta: "Ver cómo lo hacemos",
      },
      {
        icon: "herencia",
        title: "Herencias y sucesiones",
        problem: "Un momento difícil con muchos plazos. Nos encargamos del impuesto y de todo el papeleo por ti.",
        href: "/vega-asociados/herencias",
        cta: "Ver cómo te acompañamos",
      },
      {
        icon: "extranjeria",
        title: "Extranjería",
        problem: "NIE, residencia, renovaciones, reagrupación. Te guiamos paso a paso, sin colas ni sustos.",
        href: "/vega-asociados/extranjeria",
        cta: "Ver trámites",
      },
      {
        icon: "empresa",
        title: "Empresas y pymes",
        problem: "Sociedades, cuentas anuales y nóminas de tu plantilla, con un interlocutor único que conoce tu caso.",
        href: null,
        soon: true,
        cta: "Próximamente",
      },
      {
        icon: "trafico",
        title: "Tráfico",
        problem: "Transferencias, matriculaciones y bajas de vehículos resueltas en el día, sin pisar la jefatura.",
        href: null,
        soon: true,
        cta: "Próximamente",
      },
    ],
    digitalTitle: "Una gestoría que va contigo, no contra el reloj",
    digitalBody:
      "Nada de “tráeme los papeles en una carpeta”. Firmas desde el móvil, subes facturas con una foto y consultas tu situación cuando quieras desde tu portal del cliente.",
    digitalBullets: [
      "Portal del cliente con tus documentos siempre a mano",
      "Firma electrónica: cero desplazamientos",
      "Te avisamos del plazo antes de que llegue",
    ],
  },
  process: {
    kicker: "Cómo trabajamos",
    title: "Tu gestión, en 3 pasos",
    lead: "Sin reuniones eternas ni vocabulario raro. Así de sencillo es delegar tu papeleo en nosotros.",
    steps: [
      {
        title: "Nos mandas tus papeles",
        body: "Una foto, un PDF o un sobre: como te venga mejor. Nos cuentas tu caso en una primera consulta gratuita.",
      },
      {
        title: "Lo revisamos y ordenamos",
        body: "Cuadramos números, detectamos lo que te puedes ahorrar y te avisamos de cada plazo antes de que llegue.",
      },
      {
        title: "Presentamos por ti",
        body: "Hacienda, Seguridad Social, registros. Tú recibes el “hecho” y la tranquilidad de que está todo en regla.",
      },
    ],
    footnote: "Y si en algún momento tienes una duda, una persona —no un robot— te coge el teléfono.",
  },
  team: {
    kicker: "Quiénes somos",
    title: "Personas que conoces por su nombre",
    lead: "No un buzón de correo. Un equipo pequeño donde sabes quién lleva lo tuyo y puedes llamarle por su nombre.",
    members: [
      {
        name: "Carmen Vega",
        role: "Gestora colegiada · Socia fundadora",
        area: "Dirección y fiscal",
        note: "Llevo cuentas de autónomos del barrio desde antes de que existiera la factura electrónica.",
      },
      {
        name: "Luis Romero",
        role: "Asesor fiscal",
        area: "Impuestos y sociedades",
        note: "Mi trabajo es que pagues lo justo, ni un euro de más, ni un susto de menos.",
      },
      {
        name: "María Ortega",
        role: "Graduada Social",
        area: "Laboral y nóminas",
        note: "Si tienes plantilla, soy quien hace que las nóminas salgan a tiempo y sin errores.",
      },
      {
        name: "David Cano",
        role: "Responsable de trámites",
        area: "Extranjería y tráfico",
        note: "Las colas y el papeleo de ventanilla los hago yo, para que tú no pierdas la mañana.",
      },
    ],
    photoNote: "Fotos de ejemplo · sustituir por las del equipo real",
  },
  stats: {
    kicker: "Por qué fiarte",
    title: "Años, no promesas",
    lead: "En este oficio la confianza se mide en tiempo y en plazos cumplidos.",
    items: [
      { value: 27, prefix: "+", suffix: "", label: "años junto al barrio, desde 1998", emphasis: true },
      { value: 340, prefix: "", suffix: "", label: "autónomos y pymes al día con Hacienda" },
      { value: 0, prefix: "", suffix: "", label: "sanciones a clientes por plazos perdidos", emphasis: true },
      { value: 24, prefix: "", suffix: "h", label: "máximo que tardamos en contestarte" },
    ],
    note: "Cifras de ejemplo · sustituir por las reales de la gestoría",
  },
  testimonials: {
    kicker: "Lo que dicen",
    title: "Gente como tú, ya tranquila",
    google: { rating: "4,9", count: "120", label: "reseñas en Google" },
    items: [
      {
        quote: "Cambiarme de gestoría me daba una pereza enorme y resulta que se encargaron ellos de todo el traspaso. No moví un papel.",
        author: "Marta L.",
        context: "Peluquería · Madrid",
      },
      {
        quote: "Me llaman ellos antes de cada trimestre. Por primera vez no soy yo el que va corriendo a última hora.",
        author: "Javier R.",
        context: "Autónomo, reformas · Getafe",
      },
      {
        quote: "Lo de la herencia de mi padre lo llevaron con una mano izquierda increíble. Plazos, impuesto, registro… todo resuelto.",
        author: "Ana P.",
        context: "Particular · Alcalá de Henares",
      },
    ],
    sectorsTitle: "Entendemos lo tuyo",
    sectors: [
      "Hostelería",
      "Comercio de barrio",
      "Reformas y oficios",
      "Sanitarios y consultas",
      "E-commerce",
      "Profesionales y consultores",
      "Transporte",
      "Peluquería y estética",
    ],
  },
  faq: {
    kicker: "Preguntas de verdad",
    title: "Lo que casi todos nos preguntan",
    lead: "Sin letra pequeña. Si tu duda no está aquí, llámanos y te la resolvemos.",
    items: [
      {
        q: "¿Cuánto cuesta llevar un autónomo?",
        a: "Depende de tu actividad y de si tienes facturas con IVA, pero la mayoría de autónomos están en una cuota mensual cerrada, sin sorpresas. En la primera consulta te damos un precio claro para tu caso. (Importe de ejemplo en la web real: desde 0 €/mes — sustituir.)",
      },
      {
        q: "¿Os encargáis del cambio desde mi gestor actual?",
        a: "Sí, y es lo más habitual. Nosotros pedimos tus datos a tu gestoría anterior, recogemos tu historial y hacemos el traspaso sin que tengas que discutir con nadie. Tú solo nos das el “adelante”.",
      },
      {
        q: "¿Qué hago si me llega una notificación de Hacienda?",
        a: "Nos la reenvías y respiramos hondo juntos. Revisamos qué pide, si procede o no, y contestamos por ti dentro de plazo. La mayoría de “sustos” se resuelven en un trámite.",
      },
      {
        q: "¿Tengo que ir al despacho o se puede todo en remoto?",
        a: "Como prefieras. Tenemos despacho físico si te apetece vernos, pero puedes firmar y enviarnos todo desde el móvil. Atendemos a clientes de toda España.",
      },
      {
        q: "¿Mis datos están seguros?",
        a: "Tratamos nóminas, declaraciones y datos personales con confidencialidad y los guardamos cifrados. Cumplimos el RGPD y solo accede a tu información quien lleva tu caso.",
      },
    ],
  },
  contact: {
    kicker: "Hablemos",
    title: "La primera consulta es gratis (y sin compromiso)",
    lead: "Cuéntanos qué necesitas. Te decimos cómo lo haríamos y cuánto cuesta, sin letra pequeña.",
    callTitle: "Por teléfono o WhatsApp",
    callLabel: "Llámanos",
    waLabel: "Escríbenos por WhatsApp",
    emailLabel: "Escríbenos un correo",
    addressTitle: "Nuestro despacho",
    address: ["Calle de ejemplo, 00 · bajo", "28000 Madrid", "(dirección de ejemplo · demo)"],
    hoursTitle: "Horario",
    hours: [
      { label: "Lunes a jueves", value: "9:00 – 14:00 · 16:00 – 19:00" },
      { label: "Viernes", value: "9:00 – 15:00" },
      { label: "Sábado y domingo", value: "Cerrado" },
    ],
    remoteNote: "Atendemos en persona y también en remoto a toda España.",
    mapLabel: "Mapa de la ubicación del despacho (ejemplo)",
    confidentiality: "Tus datos se tratan con confidencialidad y conforme al RGPD.",
    form: {
      title: "Cuéntanos tu caso",
      lead: "Te contestamos en menos de 24 horas laborables.",
      name: "Nombre",
      namePh: "Tu nombre",
      phone: "Teléfono",
      phonePh: "600 00 00 00",
      need: "¿Qué necesitas?",
      needPh: "Elige una opción",
      needOptions: [
        "Soy autónomo / quiero darme de alta",
        "Tengo una empresa o sociedad",
        "Herencia o sucesión",
        "Extranjería (NIE, residencia…)",
        "Quiero cambiarme de gestoría",
        "Otra cosa",
      ],
      message: "Cuéntanos un poco más",
      messagePh: "¿En qué te podemos ayudar?",
      consent: "He leído y acepto la política de privacidad.",
      consentLink: "Ver política de privacidad",
      submit: "Pedir mi consulta gratis",
      sending: "Enviando…",
      successTitle: "¡Recibido!",
      successBody: "Te contestamos en menos de 24 horas laborables. Si tu caso es urgente, llámanos directamente.",
      required: "obligatorio",
    },
  },
  close: {
    kicker: "Y entonces…",
    heading: "Tú a lo tuyo. De Hacienda nos encargamos nosotros.",
    body: "El lío de papeles del principio ya está ordenado, presentado y al día. Esa es toda la diferencia: dejar de pensar en ello.",
    statusLabel: "Todo al día",
    ctaPrimary: "Empezar con la consulta gratis",
    ctaSecondary: "Llamar ahora",
  },
  footer: {
    tagline: "Gestoría y asesoría de toda la vida, con las herramientas de hoy.",
    navTitle: "La web",
    servicesTitle: "Servicios",
    legalTitle: "Legal",
    legalLinks: [
      { label: "Aviso legal", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Política de cookies", href: "#" },
      { label: "Canal de quejas y reclamaciones", href: "#" },
    ],
    fiscalTitle: "Datos fiscales",
    fiscalLines: [
      "Vega & Asociados Gestoría, S.L.",
      "CIF B00000000",
      "Calle de ejemplo, 00 · bajo — 28000 Madrid",
      "(Datos de ejemplo · demo — sustituir por los reales)",
    ],
    colegiadoLine: "Gestor colegiado nº 0000 · Ilustre Colegio Oficial de Gestores Administrativos (placeholder)",
    confidentiality: "Tratamos tus datos con confidencialidad y conforme al RGPD.",
    copyright: "Vega & Asociados — demo ficticia creada por ebecerra.es",
    demoNote: "Esta es una web de ejemplo. Los datos, sellos y cifras son ficticios y sustituibles por los reales.",
    backToTop: "Volver arriba",
  },
  cookies: {
    text: "Usamos cookies propias y de terceros para que la web funcione y entender cómo se usa. Tú decides.",
    accept: "Aceptar",
    reject: "Solo las necesarias",
    link: "Más información",
  },
  servicePage: {
    breadcrumbHome: "Inicio",
    includedDefault: "Qué incluye",
    backTitle: "¿Buscabas otra cosa?",
    backLead: "Estos son el resto de servicios. Si no ves el tuyo, llámanos y te decimos.",
    others: [
      { label: "Autónomos", href: "/vega-asociados/autonomos" },
      { label: "Herencias y sucesiones", href: "/vega-asociados/herencias" },
      { label: "Extranjería", href: "/vega-asociados/extranjeria" },
      { label: "Empresas y pymes", href: "/vega-asociados#servicios", soon: true },
      { label: "Tráfico", href: "/vega-asociados#servicios", soon: true },
    ],
  },
  services_detail: {
    autonomos: {
      slug: "autonomos",
      kicker: "Servicios · Autónomos",
      title: "Tu gestoría de autónomo, sin sustos",
      lead: "Del alta hasta la renta, te llevamos todo el papeleo y te avisamos antes de cada plazo. Tú factura, que de Hacienda nos encargamos nosotros.",
      intro: "Ser autónomo ya es bastante trabajo como para encima pelearte con modelos, plazos y siglas. Nos ocupamos de tu día a día fiscal con una cuota cerrada y una persona que conoce tu caso.",
      included: {
        title: "Qué incluye",
        items: [
          { name: "Alta y trámites de inicio", desc: "Alta en Hacienda (036/037) y en autónomos de la Seguridad Social, elección de epígrafes y de la cuota que más te conviene." },
          { name: "Tus trimestres (IVA y pagos a cuenta)", desc: "Presentamos tu IVA (modelo 303) y tu IRPF (modelo 130) cada trimestre, revisando que no pagas de más." },
          { name: "Declaración de la Renta", desc: "Tu renta anual con todas las deducciones de autónomo que te corresponden, sin que se escape ninguna." },
          { name: "Facturas y libros al día", desc: "Llevamos tus libros de ingresos y gastos y te decimos qué puedes desgravar y qué no." },
          { name: "Avisos de plazos", desc: "Te avisamos antes de cada vencimiento. No vuelves a llegar tarde a un trimestre." },
        ],
      },
      forWho: {
        title: "Para ti, si…",
        body: "Trabajas por tu cuenta y quieres dejar de perder tardes con el papeleo.",
        items: [
          "Te acabas de dar de alta o estás a punto",
          "Llevas tú las cuentas y ya no te compensa el tiempo",
          "Tienes una gestoría pero no te coge nunca el teléfono",
          "Facturas con y sin IVA y te lías con los modelos",
        ],
      },
      process: {
        title: "Cómo empezamos",
        lead: "En una semana puedes tenerlo todo en orden.",
        steps: [
          { title: "Primera consulta gratis", body: "Nos cuentas tu actividad y te decimos qué necesitas y cuánto costaría." },
          { title: "Nos das el relevo", body: "Si vienes de otra gestoría, hacemos el traspaso nosotros. Si empiezas, te damos de alta." },
          { title: "A partir de ahí, tranquilidad", body: "Nos mandas tus facturas como te venga bien y nosotros presentamos por ti, a tiempo." },
        ],
      },
      faq: {
        title: "Dudas de autónomo",
        items: [
          { q: "¿Cuánto cuesta al mes?", a: "Una cuota cerrada según tu actividad y volumen, sin sorpresas. Te la decimos en la primera consulta. (Importe de ejemplo en la web real — sustituir.)" },
          { q: "Me acabo de quedar en paro, ¿me compensa hacerme autónomo?", a: "Lo vemos juntos: tarifa plana, previsión de ingresos y gastos. A veces sí, a veces conviene esperar. Te lo decimos claro." },
          { q: "¿Y si un trimestre no he facturado nada?", a: "Hay que presentar igualmente los modelos en cero. Nosotros nos encargamos para que no te llegue ningún requerimiento." },
        ],
      },
      cta: {
        title: "¿Empezamos con tu alta o tu traspaso?",
        body: "La primera consulta es gratis y sin compromiso. Te decimos qué necesitas y cuánto cuesta.",
      },
    },
    herencias: {
      slug: "herencias",
      kicker: "Servicios · Herencias y sucesiones",
      title: "Una herencia, con alguien que la lleve por ti",
      lead: "En un momento difícil, lo último que necesitas es pelearte con plazos e impuestos. Nos encargamos de todo el papeleo de la sucesión, con calma y de tu parte.",
      intro: "Una herencia tiene plazos cortos (seis meses para el impuesto) y muchos pasos: certificados, escritura, impuesto de sucesiones, cambios de titularidad. Lo ordenamos por ti y te explicamos cada paso sin prisa.",
      included: {
        title: "Qué incluye",
        items: [
          { name: "Documentación inicial", desc: "Certificado de defunción, de últimas voluntades y de seguros. Reunimos todo lo necesario para empezar." },
          { name: "Cuaderno particional", desc: "Inventario de bienes y reparto entre herederos, coordinándolo con la notaría." },
          { name: "Impuesto de Sucesiones y Donaciones", desc: "Calculamos y presentamos el impuesto dentro de plazo, aplicando las reducciones que correspondan." },
          { name: "Plusvalía municipal", desc: "Gestionamos el impuesto del ayuntamiento por los inmuebles heredados." },
          { name: "Cambios de titularidad", desc: "Inscripción en el Registro y cambio de titularidad de inmuebles, vehículos y cuentas." },
        ],
      },
      forWho: {
        title: "Para ti, si…",
        body: "Has perdido a un familiar y te toca gestionar la herencia.",
        items: [
          "No sabes por dónde empezar ni qué plazos hay",
          "Sois varios herederos y queréis hacerlo bien",
          "Hay inmuebles, un negocio o cuentas que cambiar de titular",
          "Quieres saber cuánto se paga antes de dar pasos",
        ],
      },
      process: {
        title: "Cómo te acompañamos",
        lead: "Tú pones el café; nosotros, el orden.",
        steps: [
          { title: "Nos cuentas la situación", body: "En una primera consulta vemos qué hay, quiénes sois y qué plazos corren." },
          { title: "Reunimos y calculamos", body: "Pedimos los certificados, hacemos el inventario y te decimos qué impuesto saldría." },
          { title: "Presentamos y registramos", body: "Coordinamos notaría, impuesto y registro para que todo quede a vuestro nombre." },
        ],
      },
      faq: {
        title: "Dudas sobre herencias",
        items: [
          { q: "¿Cuánto tiempo tengo para el impuesto?", a: "Seis meses desde el fallecimiento, prorrogables otros seis si se pide a tiempo. Mejor no apurar: nosotros vigilamos el plazo por ti." },
          { q: "¿Cuánto se paga de impuesto de sucesiones?", a: "Depende de la comunidad autónoma, el parentesco y el patrimonio. En muchos casos las reducciones lo dejan en muy poco. Te lo calculamos antes de dar pasos." },
          { q: "¿Y si no nos ponemos de acuerdo los herederos?", a: "Te ayudamos a ordenar la parte que sí está clara y, si hace falta, te orientamos sobre los siguientes pasos legales." },
        ],
      },
      cta: {
        title: "¿Hablamos sin compromiso?",
        body: "Cuéntanos tu situación con calma. La primera consulta es gratuita y te decimos exactamente qué hay que hacer.",
      },
    },
    extranjeria: {
      slug: "extranjeria",
      kicker: "Servicios · Extranjería",
      title: "Tus trámites de extranjería, paso a paso",
      lead: "NIE, residencia, renovaciones, reagrupación familiar, nacionalidad. Te guiamos por cada trámite y preparamos tu expediente para que no se quede en nada por un papel.",
      intro: "La extranjería tiene plazos, tasas y documentos muy concretos donde un error te cuesta meses. Preparamos tu expediente completo, pedimos cita y te decimos exactamente qué llevar.",
      included: {
        title: "Qué incluye",
        items: [
          { name: "NIE y certificados", desc: "Obtención del NIE y del certificado de registro de ciudadano de la UE." },
          { name: "Autorizaciones de residencia", desc: "Residencia y trabajo, arraigo, estudiantes. Preparamos y presentamos el expediente." },
          { name: "Renovaciones", desc: "Renovación de tarjetas y permisos antes de que caduquen, sin que pierdas tu situación legal." },
          { name: "Reagrupación familiar", desc: "Traer a tu familia: requisitos, documentación y seguimiento del expediente." },
          { name: "Nacionalidad española", desc: "Solicitud por residencia: preparación del expediente y seguimiento hasta la resolución." },
        ],
      },
      forWho: {
        title: "Para ti, si…",
        body: "Necesitas regularizar o renovar tu situación, o traer a los tuyos.",
        items: [
          "Acabas de llegar y necesitas tu NIE o residencia",
          "Se te caduca la tarjeta y no quieres arriesgarte",
          "Quieres reagrupar a tu familia",
          "Llevas años aquí y vas a por la nacionalidad",
        ],
      },
      process: {
        title: "Cómo lo hacemos",
        lead: "Tú aportas los documentos; las colas y la cita, nosotros.",
        steps: [
          { title: "Revisamos tu caso", body: "Vemos qué trámite te toca, qué plazos hay y qué documentos necesitas." },
          { title: "Preparamos el expediente", body: "Reunimos y revisamos todo, rellenamos los modelos y pagamos las tasas." },
          { title: "Presentamos y seguimos", body: "Pedimos cita, presentamos y hacemos seguimiento hasta la resolución." },
        ],
      },
      faq: {
        title: "Dudas de extranjería",
        items: [
          { q: "¿Cuánto tarda un trámite?", a: "Depende del tipo y de la oficina, desde unas semanas a varios meses. Te damos una previsión realista y vigilamos los plazos." },
          { q: "¿Tengo que ir yo a la cita?", a: "En la mayoría de trámites de huella sí, pero te decimos exactamente cuándo, dónde y qué llevar. Del resto nos encargamos nosotros." },
          { q: "Se me caduca pronto la tarjeta, ¿llego?", a: "Cuanto antes lo veamos, mejor. Hay márgenes para renovar; escríbenos y lo comprobamos hoy mismo." },
        ],
      },
      cta: {
        title: "¿Empezamos con tu trámite?",
        body: "Cuéntanos qué necesitas y te decimos qué documentos hacen falta y cuánto cuesta. Primera consulta gratis.",
      },
    },
  },
};

/* ============================== ENGLISH ================================== */
const EN: GestoriaContent = {
  locale: "en",
  brand: BRAND,
  phone: PHONE,
  whatsapp: WHATSAPP,
  email: EMAIL,
  nav: {
    skip: "Skip to content",
    primaryNav: "Main navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    servicesLabel: "Services",
    links: [
      { label: "Services", href: "#servicios" },
      { label: "How we work", href: "#proceso" },
      { label: "Team", href: "#equipo" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contacto" },
    ],
    serviceLinks: [
      { label: "Freelancers", href: "/en/vega-asociados/autonomos" },
      { label: "Inheritance", href: "/en/vega-asociados/herencias" },
      { label: "Immigration", href: "/en/vega-asociados/extranjeria" },
      { label: "Companies & SMEs", href: "#servicios", soon: true },
      { label: "Vehicle paperwork", href: "#servicios", soon: true },
    ],
    ctaLabel: "Free first consultation",
    callLabel: "Call",
    waLabel: "WhatsApp",
  },
  hero: {
    kicker: "Tax & business advisory · since 1998",
    headingLead: "Your taxes in order,",
    headingAccent: "and you",
    headingTail: "sleeping easy.",
    sub: "We handle the paperwork, the deadlines and the tax office for you. You focus on your work — we'll take care of the rest.",
    sello: {
      label: "Registered agent",
      number: "No. 0000",
      note: "Sample seal · replace with the real registration",
    },
    ctaPrimary: "Free first consultation",
    ctaSecondary: "Message us on WhatsApp",
    chaosNote: "Your paperwork, today",
    orderNote: "Your papers in their place, up to date",
    scrollHint: "Scroll and we'll explain",
    pauseAnim: "Pause animation",
    playAnim: "Resume animation",
  },
  countdown: {
    label: "Next tax deadline",
    daysWord: "days",
    dayWord: "day",
    todayLabel: "is today",
    nextLabel: "until",
    aria: "Countdown to the next tax deadline",
    deadlines: [
      { md: "01-20", label: "Q4 VAT and withholdings" },
      { md: "01-30", label: "Annual VAT summary (form 390)" },
      { md: "04-20", label: "Q1 VAT and income tax" },
      { md: "06-30", label: "Annual income tax return" },
      { md: "07-20", label: "Q2 VAT and income tax" },
      { md: "07-25", label: "Corporate tax (form 200)" },
      { md: "10-20", label: "Q3 VAT and income tax" },
    ],
  },
  trust: {
    srLabel: "Accreditations and credentials (demo examples)",
    items: [
      "Registered agent · ICOGA",
      "AEAT social collaborator",
      "RED authorised · Social Security",
      "PAE / CIRCE point",
      "Institute of Economists · REAF",
      "Registered labour graduate",
      "E-signature and client portal",
      "Encrypted, confidential data",
    ],
  },
  services: {
    kicker: "What we do",
    title: "All your paperwork, in one place",
    lead: "Four areas that cover the tax life of a freelancer or a company. No jargon — we explain it the way you'd explain it.",
    areasTitle: "Our areas",
    areas: [
      {
        icon: "fiscal",
        title: "Tax",
        problem: "We file your taxes (income tax, VAT, corporate tax) on time and right, so you never risk a penalty.",
      },
      {
        icon: "laboral",
        title: "Payroll & labour",
        problem: "Payroll, contracts and Social Security up to date, without you chasing every deadline.",
      },
      {
        icon: "contable",
        title: "Accounting",
        problem: "We keep your books and annual accounts with the order you'd want for your own business.",
      },
      {
        icon: "mercantil",
        title: "Legal & corporate",
        problem: "Setting up a company, an inheritance or a contract: the legal paperwork solved by people who know.",
      },
    ],
    pathsTitle: "So, what do you need?",
    pathsLead: "Each situation has its own page, with what's included and how we do it.",
    paths: [
      {
        icon: "autonomo",
        title: "Freelancers",
        problem: "From registering to your quarterly returns and income tax. We handle it all and warn you before each deadline.",
        href: "/en/vega-asociados/autonomos",
        cta: "See how we do it",
      },
      {
        icon: "herencia",
        title: "Inheritance",
        problem: "A hard moment with many deadlines. We take care of the tax and all the paperwork for you.",
        href: "/en/vega-asociados/herencias",
        cta: "See how we help",
      },
      {
        icon: "extranjeria",
        title: "Immigration",
        problem: "NIE, residence, renewals, family reunification. We guide you step by step, no queues, no scares.",
        href: "/en/vega-asociados/extranjeria",
        cta: "See procedures",
      },
      {
        icon: "empresa",
        title: "Companies & SMEs",
        problem: "Companies, annual accounts and staff payroll, with a single contact who knows your case.",
        href: null,
        soon: true,
        cta: "Coming soon",
      },
      {
        icon: "trafico",
        title: "Vehicle paperwork",
        problem: "Transfers, registrations and de-registrations sorted same day, without setting foot in the office.",
        href: null,
        soon: true,
        cta: "Coming soon",
      },
    ],
    digitalTitle: "A firm that moves with you, not against the clock",
    digitalBody:
      "No more “bring me the papers in a folder”. Sign from your phone, upload invoices with a photo and check your situation whenever you like from your client portal.",
    digitalBullets: [
      "Client portal with your documents always at hand",
      "E-signature: zero trips to the office",
      "We warn you about the deadline before it arrives",
    ],
  },
  process: {
    kicker: "How we work",
    title: "Your paperwork, in 3 steps",
    lead: "No endless meetings, no strange vocabulary. This is how simple it is to hand us your paperwork.",
    steps: [
      {
        title: "You send us your papers",
        body: "A photo, a PDF or an envelope — whatever suits you. You tell us your case in a free first consultation.",
      },
      {
        title: "We review and tidy it up",
        body: "We balance the numbers, spot what you can save and warn you about every deadline before it arrives.",
      },
      {
        title: "We file it for you",
        body: "Tax office, Social Security, registries. You just get the “done” and the peace of mind that it's all in order.",
      },
    ],
    footnote: "And whenever you have a question, a person — not a bot — picks up the phone.",
  },
  team: {
    kicker: "Who we are",
    title: "People you know by name",
    lead: "Not an inbox. A small team where you know who handles your case and can call them by their name.",
    members: [
      {
        name: "Carmen Vega",
        role: "Registered agent · Founding partner",
        area: "Management & tax",
        note: "I've kept the books of local freelancers since before e-invoicing existed.",
      },
      {
        name: "Luis Romero",
        role: "Tax advisor",
        area: "Taxes & companies",
        note: "My job is for you to pay exactly what's fair — not a euro more, not a scare less.",
      },
      {
        name: "María Ortega",
        role: "Labour graduate",
        area: "Payroll & labour",
        note: "If you have staff, I'm the one who makes payroll go out on time and without errors.",
      },
      {
        name: "David Cano",
        role: "Procedures lead",
        area: "Immigration & vehicles",
        note: "The queues and counter paperwork are on me, so you don't lose your morning.",
      },
    ],
    photoNote: "Sample photos · replace with the real team",
  },
  stats: {
    kicker: "Why trust us",
    title: "Years, not promises",
    lead: "In this trade, trust is measured in time and in deadlines met.",
    items: [
      { value: 27, prefix: "+", suffix: "", label: "years with the neighbourhood, since 1998", emphasis: true },
      { value: 340, prefix: "", suffix: "", label: "freelancers and SMEs up to date with the tax office" },
      { value: 0, prefix: "", suffix: "", label: "client penalties from missed deadlines", emphasis: true },
      { value: 24, prefix: "", suffix: "h", label: "the most we take to get back to you" },
    ],
    note: "Sample figures · replace with the firm's real ones",
  },
  testimonials: {
    kicker: "What they say",
    title: "People like you, already at ease",
    google: { rating: "4.9", count: "120", label: "Google reviews" },
    items: [
      {
        quote: "Switching firms felt like such a hassle, and it turned out they handled the whole transfer. I didn't move a single paper.",
        author: "Marta L.",
        context: "Hair salon · Madrid",
      },
      {
        quote: "They call me before every quarter. For the first time I'm not the one rushing at the last minute.",
        author: "Javier R.",
        context: "Freelancer, renovations · Getafe",
      },
      {
        quote: "They handled my father's inheritance with incredible care. Deadlines, tax, registry… all sorted.",
        author: "Ana P.",
        context: "Private client · Alcalá de Henares",
      },
    ],
    sectorsTitle: "We get your line of work",
    sectors: [
      "Hospitality",
      "Local shops",
      "Renovations & trades",
      "Healthcare practices",
      "E-commerce",
      "Consultants & professionals",
      "Transport",
      "Hair & beauty",
    ],
  },
  faq: {
    kicker: "Real questions",
    title: "What almost everyone asks us",
    lead: "No small print. If your question isn't here, call us and we'll answer it.",
    items: [
      {
        q: "How much does it cost to handle a freelancer?",
        a: "It depends on your activity and whether you invoice with VAT, but most freelancers pay a fixed monthly fee, no surprises. In the first consultation we give you a clear price for your case. (Sample amount on the real site — replace.)",
      },
      {
        q: "Do you handle the switch from my current accountant?",
        a: "Yes, and it's the most common thing. We request your data from your previous firm, collect your history and do the transfer without you having to argue with anyone. You just give us the go-ahead.",
      },
      {
        q: "What do I do if I get a notice from the tax office?",
        a: "You forward it to us and we breathe out together. We check what it asks, whether it applies or not, and respond for you within the deadline. Most “scares” are solved with a single procedure.",
      },
      {
        q: "Do I have to come to the office or can it all be remote?",
        a: "Whatever you prefer. We have a physical office if you'd like to meet, but you can sign and send us everything from your phone. We serve clients all across Spain.",
      },
      {
        q: "Is my data safe?",
        a: "We handle payroll, tax returns and personal data confidentially and store it encrypted. We comply with GDPR and only the person handling your case can access your information.",
      },
    ],
  },
  contact: {
    kicker: "Let's talk",
    title: "The first consultation is free (and with no commitment)",
    lead: "Tell us what you need. We'll tell you how we'd do it and what it costs, with no small print.",
    callTitle: "By phone or WhatsApp",
    callLabel: "Call us",
    waLabel: "Message us on WhatsApp",
    emailLabel: "Send us an email",
    addressTitle: "Our office",
    address: ["Sample street, 00 · ground floor", "28000 Madrid", "(sample address · demo)"],
    hoursTitle: "Opening hours",
    hours: [
      { label: "Monday to Thursday", value: "9:00 – 14:00 · 16:00 – 19:00" },
      { label: "Friday", value: "9:00 – 15:00" },
      { label: "Saturday & Sunday", value: "Closed" },
    ],
    remoteNote: "We work in person and remotely across all of Spain.",
    mapLabel: "Map of the office location (sample)",
    confidentiality: "Your data is handled confidentially and in line with GDPR.",
    form: {
      title: "Tell us your case",
      lead: "We'll get back to you within 24 working hours.",
      name: "Name",
      namePh: "Your name",
      phone: "Phone",
      phonePh: "600 00 00 00",
      need: "What do you need?",
      needPh: "Choose an option",
      needOptions: [
        "I'm a freelancer / want to register",
        "I have a company",
        "Inheritance or succession",
        "Immigration (NIE, residence…)",
        "I want to switch firms",
        "Something else",
      ],
      message: "Tell us a bit more",
      messagePh: "How can we help?",
      consent: "I've read and accept the privacy policy.",
      consentLink: "View privacy policy",
      submit: "Book my free consultation",
      sending: "Sending…",
      successTitle: "Got it!",
      successBody: "We'll get back to you within 24 working hours. If your case is urgent, call us directly.",
      required: "required",
    },
  },
  close: {
    kicker: "And then…",
    heading: "You focus on your work. We'll take care of the tax office.",
    body: "The pile of papers from the start is now tidied, filed and up to date. That's the whole difference: not having to think about it anymore.",
    statusLabel: "All up to date",
    ctaPrimary: "Start with the free consultation",
    ctaSecondary: "Call now",
  },
  footer: {
    tagline: "A traditional firm, with today's tools.",
    navTitle: "The site",
    servicesTitle: "Services",
    legalTitle: "Legal",
    legalLinks: [
      { label: "Legal notice", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "Complaints channel", href: "#" },
    ],
    fiscalTitle: "Company details",
    fiscalLines: [
      "Vega & Asociados Gestoría, S.L.",
      "Tax ID B00000000",
      "Sample street, 00 · ground floor — 28000 Madrid",
      "(Sample details · demo — replace with the real ones)",
    ],
    colegiadoLine: "Registered agent no. 0000 · Official College of Administrative Agents (placeholder)",
    confidentiality: "We handle your data confidentially and in line with GDPR.",
    copyright: "Vega & Asociados — fictional demo by ebecerra.es",
    demoNote: "This is a sample website. The data, seals and figures are fictional and replaceable with real ones.",
    backToTop: "Back to top",
  },
  cookies: {
    text: "We use our own and third-party cookies to make the site work and understand how it's used. You decide.",
    accept: "Accept",
    reject: "Only essential",
    link: "Learn more",
  },
  servicePage: {
    breadcrumbHome: "Home",
    includedDefault: "What's included",
    backTitle: "Looking for something else?",
    backLead: "Here are the rest of the services. If you don't see yours, call us and we'll tell you.",
    others: [
      { label: "Freelancers", href: "/en/vega-asociados/autonomos" },
      { label: "Inheritance", href: "/en/vega-asociados/herencias" },
      { label: "Immigration", href: "/en/vega-asociados/extranjeria" },
      { label: "Companies & SMEs", href: "/en/vega-asociados#servicios", soon: true },
      { label: "Vehicle paperwork", href: "/en/vega-asociados#servicios", soon: true },
    ],
  },
  services_detail: {
    autonomos: {
      slug: "autonomos",
      kicker: "Services · Freelancers",
      title: "Your freelancer firm, no scares",
      lead: "From registering to your income tax return, we handle all the paperwork and warn you before each deadline. You invoice — we'll take care of the tax office.",
      intro: "Being a freelancer is already enough work without fighting forms, deadlines and acronyms. We handle your day-to-day tax life with a fixed fee and a person who knows your case.",
      included: {
        title: "What's included",
        items: [
          { name: "Registration and setup", desc: "Registration with the tax office and Social Security, choosing your activity codes and the fee that suits you best." },
          { name: "Your quarters (VAT and payments on account)", desc: "We file your VAT (form 303) and income tax (form 130) every quarter, checking you don't overpay." },
          { name: "Annual income tax return", desc: "Your yearly return with every freelancer deduction you're entitled to, with none slipping through." },
          { name: "Invoices and books up to date", desc: "We keep your income and expense books and tell you what you can deduct and what you can't." },
          { name: "Deadline reminders", desc: "We warn you before each due date. You'll never be late for a quarter again." },
        ],
      },
      forWho: {
        title: "This is for you if…",
        body: "You work for yourself and want to stop losing afternoons to paperwork.",
        items: [
          "You've just registered or are about to",
          "You keep the books yourself and it's no longer worth the time",
          "You have a firm but they never pick up the phone",
          "You invoice with and without VAT and get tangled in the forms",
        ],
      },
      process: {
        title: "How we start",
        lead: "In a week you can have it all in order.",
        steps: [
          { title: "Free first consultation", body: "You tell us your activity and we tell you what you need and what it would cost." },
          { title: "You hand over to us", body: "If you come from another firm, we do the transfer. If you're starting out, we register you." },
          { title: "From then on, peace of mind", body: "You send us your invoices however suits you and we file for you, on time." },
        ],
      },
      faq: {
        title: "Freelancer questions",
        items: [
          { q: "How much per month?", a: "A fixed fee based on your activity and volume, no surprises. We tell you in the first consultation. (Sample amount on the real site — replace.)" },
          { q: "I've just lost my job — is it worth going freelance?", a: "We look at it together: flat rate, projected income and expenses. Sometimes yes, sometimes it's worth waiting. We tell you straight." },
          { q: "What if I didn't invoice anything one quarter?", a: "You still have to file the forms at zero. We take care of it so you don't get any request from the tax office." },
        ],
      },
      cta: {
        title: "Shall we start your registration or transfer?",
        body: "The first consultation is free and with no commitment. We tell you what you need and what it costs.",
      },
    },
    herencias: {
      slug: "herencias",
      kicker: "Services · Inheritance & succession",
      title: "An inheritance, with someone to carry it for you",
      lead: "At a hard time, the last thing you need is to fight deadlines and taxes. We take care of all the succession paperwork, calmly and on your side.",
      intro: "An inheritance has short deadlines (six months for the tax) and many steps: certificates, deed, inheritance tax, changes of ownership. We put it in order for you and explain each step without rushing.",
      included: {
        title: "What's included",
        items: [
          { name: "Initial documentation", desc: "Death certificate, last wills certificate and insurance certificate. We gather everything needed to start." },
          { name: "Partition document", desc: "Inventory of assets and division between heirs, coordinated with the notary." },
          { name: "Inheritance and gift tax", desc: "We calculate and file the tax within the deadline, applying any reductions that apply." },
          { name: "Municipal capital gains tax", desc: "We handle the town hall's tax on the inherited properties." },
          { name: "Changes of ownership", desc: "Registry filing and change of ownership for properties, vehicles and accounts." },
        ],
      },
      forWho: {
        title: "This is for you if…",
        body: "You've lost a relative and have to manage the inheritance.",
        items: [
          "You don't know where to start or what deadlines there are",
          "There are several heirs and you want to do it right",
          "There are properties, a business or accounts to transfer",
          "You want to know how much it costs before taking steps",
        ],
      },
      process: {
        title: "How we accompany you",
        lead: "You make the coffee; we bring the order.",
        steps: [
          { title: "You tell us the situation", body: "In a first consultation we see what there is, who you are and what deadlines are running." },
          { title: "We gather and calculate", body: "We request the certificates, draw up the inventory and tell you what the tax would be." },
          { title: "We file and register", body: "We coordinate notary, tax and registry so everything ends up in your name." },
        ],
      },
      faq: {
        title: "Inheritance questions",
        items: [
          { q: "How long do I have for the tax?", a: "Six months from the death, extendable by another six if requested in time. Better not to cut it close: we watch the deadline for you." },
          { q: "How much is inheritance tax?", a: "It depends on the region, the relationship and the estate. In many cases the reductions leave it at very little. We calculate it before you take steps." },
          { q: "What if the heirs don't agree?", a: "We help you sort out the part that is clear and, if needed, guide you on the next legal steps." },
        ],
      },
      cta: {
        title: "Shall we talk, no commitment?",
        body: "Tell us your situation calmly. The first consultation is free and we tell you exactly what needs doing.",
      },
    },
    extranjeria: {
      slug: "extranjeria",
      kicker: "Services · Immigration",
      title: "Your immigration paperwork, step by step",
      lead: "NIE, residence, renewals, family reunification, citizenship. We guide you through each procedure and prepare your file so nothing falls through over one missing paper.",
      intro: "Immigration has very specific deadlines, fees and documents where one mistake costs you months. We prepare your complete file, book the appointment and tell you exactly what to bring.",
      included: {
        title: "What's included",
        items: [
          { name: "NIE and certificates", desc: "Obtaining the NIE and the EU citizen registration certificate." },
          { name: "Residence authorisations", desc: "Residence and work, roots-based permits, students. We prepare and file the application." },
          { name: "Renewals", desc: "Renewing cards and permits before they expire, so you don't lose your legal status." },
          { name: "Family reunification", desc: "Bringing your family: requirements, documentation and follow-up of the file." },
          { name: "Spanish citizenship", desc: "Application by residence: preparing the file and following up to resolution." },
        ],
      },
      forWho: {
        title: "This is for you if…",
        body: "You need to regularise or renew your status, or bring your family.",
        items: [
          "You've just arrived and need your NIE or residence",
          "Your card is expiring and you don't want to risk it",
          "You want to reunite with your family",
          "You've been here years and are going for citizenship",
        ],
      },
      process: {
        title: "How we do it",
        lead: "You provide the documents; the queues and appointment are on us.",
        steps: [
          { title: "We review your case", body: "We see which procedure applies, what deadlines there are and what documents you need." },
          { title: "We prepare the file", body: "We gather and check everything, fill in the forms and pay the fees." },
          { title: "We file and follow up", body: "We book the appointment, file, and follow up to resolution." },
        ],
      },
      faq: {
        title: "Immigration questions",
        items: [
          { q: "How long does a procedure take?", a: "It depends on the type and the office, from a few weeks to several months. We give you a realistic estimate and watch the deadlines." },
          { q: "Do I have to go to the appointment?", a: "For most fingerprint procedures, yes, but we tell you exactly when, where and what to bring. We handle the rest." },
          { q: "My card expires soon — will I make it?", a: "The sooner we look at it, the better. There are margins to renew; message us and we'll check today." },
        ],
      },
      cta: {
        title: "Shall we start your procedure?",
        body: "Tell us what you need and we'll tell you which documents are required and what it costs. Free first consultation.",
      },
    },
  },
};

const CONTENT: Record<Locale, GestoriaContent> = { es: ES, en: EN };

export function getGestoriaContent(locale: Locale): GestoriaContent {
  return CONTENT[locale] ?? ES;
}
