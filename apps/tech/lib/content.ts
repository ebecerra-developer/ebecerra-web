import type { Locale } from "@/i18n/routing";
import type {
  Feature,
  ExperienceItem,
  Skill,
  Project,
} from "@ebecerra/sanity-client";

export type {
  Feature,
  ExperienceItem,
  Skill,
  ProjectLink,
  Project,
} from "@ebecerra/sanity-client";

export type FooterLink = { label: string; url: string };

type Fallback = {
  aboutFeatures: Feature[];
  experience: ExperienceItem[];
  skills: Skill[];
  tags: string[];
  projects: Project[];
  footerLinks: FooterLink[];
};

const es: Fallback = {
  aboutFeatures: [
    {
      icon: "🏗️",
      label: "Arquitectura de Software",
      desc: "Diseño de sistemas escalables, mantenibles y migrables entre versiones",
    },
    {
      icon: "👨‍🏫",
      label: "Formación y comunidad",
      desc: "Coordinador del gremio VassNolia, formador de clientes y equipos internos",
    },
    {
      icon: "🔍",
      label: "Magnolia CMS",
      desc: "Associate Developer desde 2018 · 8 años en producción",
    },
    {
      icon: "🏛️",
      label: "Sector público",
      desc: "6 proyectos para AAPP: MAPA, SEPE, INECO, PAG, MECD, Bibliotecas",
    },
  ],
  experience: [
    {
      company: "VASS",
      role: "Tech Architect Lead",
      period: "mar 2024 – presente",
      tag: "actual",
      desc: "Liderazgo técnico en proyectos enterprise: web comercial de CBNK (desarrollo y mantenimiento evolutivo), migraciones de CMS e intranets del Ministerio de Agricultura (MAPA), y componentes de Blogs & Knowledge para Atradius. Formación Magnolia a clientes, colaboración en RFPs nacionales e internacionales y soporte técnico transversal.",
    },
    {
      company: "VASS University",
      role: "Coordinador de gremio",
      period: "ago 2024 – presente",
      tag: "actual",
      desc: "Coordinador del gremio Magnolia DXP (VassNolia). Gestión de formación, documentación, sesiones en directo, cursos y actividades del gremio.",
    },
    {
      company: "VASS",
      role: "Arquitecto de Software",
      period: "jun 2023 – mar 2024",
      tag: null,
      desc: "Arquitectura y liderazgo técnico en proyectos Magnolia: mantenimiento del portal Faculty del Instituto de Empresa (alta de profesorado, clientes REST a servicios internos) y liderazgo de migraciones de versión e integraciones en la intranet de Prosegur. Tutor y formador en equipos internos.",
    },
    {
      company: "VASS",
      role: "Consultor / Analista Programador",
      period: "jul 2021 – oct 2023",
      tag: null,
      desc: "Análisis funcional y técnico, desarrollo full stack, formación y tutoría en proyectos Magnolia. Proyectos destacados: portal Faculty del Instituto de Empresa (análisis y desarrollo del proceso de alta de profesorado, clientes REST) y soporte técnico continuo de la intranet de Prosegur (integraciones con APIs externas y evolutivos).",
    },
    {
      company: "Bilbomatica",
      role: "Analista Programador",
      period: "oct 2019 – jul 2021",
      tag: null,
      desc: "Proyectos Magnolia CMS para sector público: Punto de Acceso General del Ministerio de Función Pública (web y aplicativo Java/Spring), desarrollo desde cero de la web e intranet del Ministerio de Ciencia e Innovación (INECO/MCIN), y chatbot del SEPE integrado con un motor de IA de terceros (interfaz de alta de datos de entrenamiento y dashboard de conversaciones).",
    },
    {
      company: "Bilbomatica",
      role: "Programador Sénior",
      period: "jul 2018 – abr 2019",
      tag: null,
      desc: "Desarrollo en Magnolia CMS sobre Apache Tomcat. Mantenimiento, refactoring y migraciones de versión en los portales del Ministerio de Educación, Cultura y Deporte (MECD/MCD), y desarrollo de un generador automático de portales para la red de Bibliotecas Públicas — plantillas parametrizadas en Magnolia para desplegar sites independientes por biblioteca.",
    },
    {
      company: "Grupo Onetec",
      role: "Programador",
      period: "abr 2019 – sep 2019",
      tag: null,
      desc: "Asignado a Línea Directa Aseguradora: desarrollo de nuevos flujos de alta de partes y secciones del área motor en la web corporativa, y migración de servicios SOAP antiguos a REST. Stack: JSF, REST.",
    },
  ],
  skills: [
    { name: "Magnolia CMS", level: 98 },
    { name: "Java", level: 95 },
    { name: "Architecture", level: 90 },
    { name: "Leadership", level: 92 },
    { name: "Spring", level: 85 },
    { name: "Agile", level: 90 },
    { name: "Mentoring", level: 88 },
    { name: "JavaScript", level: 75 },
    { name: "SQL", level: 80 },
    { name: "Groovy", level: 78 },
    { name: "FreeMarker", level: 82 },
    { name: "Artificial Intelligence", level: 65 },
  ],
  tags: [
    "Maven",
    "Docker",
    "Git",
    "SVN",
    "Jenkins",
    "REST",
    "WebServices",
    "SQL",
    "FreeMarker",
    "Groovy",
    "Accessibility",
    "Responsive",
  ],
  projects: [
    {
      id: "piezas",
      label: "mobile · puzzle",
      title: "Piezas",
      description:
        "Juego de puzzles con tus propias fotos. Sin anuncios, sin trucos. Una experiencia personal y relajante pensada para disfrutar en cualquier momento.",
      tech: ["React", "Capacitor", "Android Nativo"],
      status: "beta",
      statusText: "beta disponible",
      links: [{ text: "$ ver_landing", href: "/piezas-game/", external: true }],
    },
    {
      id: "rpg",
      label: "web · IA · fan project",
      title: "Grand Line RPG",
      description:
        "Juego de rol narrativo ambientado en el universo de One Piece. Los LLMs actúan como narradores adaptativos que responden a tus decisiones y construyen la historia en tiempo real.",
      tech: ["React", "LLM API", "Narrative AI"],
      status: "fan",
      statusText: "fan project · no comercial",
      links: [
        {
          text: "$ jugar →",
          href: "https://rpg-chat-game.vercel.app",
          external: true,
        },
      ],
    },
  ],
  footerLinks: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/enrique-becerra-garcia/",
    },
    { label: "Email", url: "mailto:quique.ebecerra@gmail.com" },
  ],
};

const en: Fallback = {
  aboutFeatures: [
    {
      icon: "🏗️",
      label: "Software Architecture",
      desc: "Scalable, maintainable systems designed to survive version migrations",
    },
    {
      icon: "👨‍🏫",
      label: "Training & community",
      desc: "Coordinator of the VassNolia guild, trainer for clients and internal teams",
    },
    {
      icon: "🔍",
      label: "Magnolia CMS",
      desc: "Associate Developer since 2018 · 8 years in production",
    },
    {
      icon: "🏛️",
      label: "Government sector",
      desc: "6 projects for Spanish government: MAPA, SEPE, INECO, PAG, MECD, Libraries",
    },
  ],
  experience: [
    {
      company: "VASS",
      role: "Tech Architect Lead",
      period: "Mar 2024 – present",
      tag: "current",
      desc: "Technical leadership on enterprise projects: CBNK's commercial banking website (build and ongoing maintenance), CMS migrations and intranets for Spain's Ministry of Agriculture (MAPA), and Blogs & Knowledge components across Atradius. Magnolia training delivered to clients, national and international RFP contributions and cross-project technical support.",
    },
    {
      company: "VASS University",
      role: "Guild Coordinator",
      period: "Aug 2024 – present",
      tag: "current",
      desc: "Coordinator of the Magnolia DXP guild (VassNolia). Training management, documentation, live sessions, courses and guild activities.",
    },
    {
      company: "VASS",
      role: "Software Architect",
      period: "Jun 2023 – Mar 2024",
      tag: null,
      desc: "Architecture and technical leadership on Magnolia projects: maintenance of IE Business School's Faculty portal (onboarding process, REST clients to internal services) and leadership of version migrations and integrations on Prosegur's corporate intranet. Mentor and trainer for internal teams.",
    },
    {
      company: "VASS",
      role: "Consultant / Analyst Programmer",
      period: "Jul 2021 – Oct 2023",
      tag: null,
      desc: "Functional and technical analysis, full-stack development, training and mentoring on Magnolia projects. Featured work: IE Business School's Faculty portal (analysis and build of the faculty onboarding process, REST clients) and ongoing technical support of Prosegur's corporate intranet (external API integrations and enhancements).",
    },
    {
      company: "Bilbomatica",
      role: "Analyst Programmer",
      period: "Oct 2019 – Jul 2021",
      tag: null,
      desc: "Magnolia CMS projects for Spanish government: the General Access Point of the Ministry of Civil Service (website and a related Java/Spring application), from-scratch build of the Ministry of Science and Innovation's (INECO/MCIN) website and intranet, and SEPE's chatbot integrated with a third-party AI engine (training-data entry UI and conversation dashboard).",
    },
    {
      company: "Bilbomatica",
      role: "Senior Developer",
      period: "Jul 2018 – Apr 2019",
      tag: null,
      desc: "Magnolia CMS development over Apache Tomcat. Maintenance, refactoring and version migrations across the portals of Spain's Ministry of Education, Culture & Sport (MECD/MCD), plus development of an automated portal generator for the Public Libraries network — parameterized Magnolia templates to spin up independent sites per library.",
    },
    {
      company: "Grupo Onetec",
      role: "Developer",
      period: "Apr 2019 – Sep 2019",
      tag: null,
      desc: "Assigned to Línea Directa Aseguradora: new claim-filing flows and website sections for the motor insurance area, plus migration of legacy SOAP services to REST. Stack: JSF, REST.",
    },
  ],
  skills: [
    { name: "Magnolia CMS", level: 98 },
    { name: "Java", level: 95 },
    { name: "Architecture", level: 90 },
    { name: "Leadership", level: 92 },
    { name: "Spring", level: 85 },
    { name: "Agile", level: 90 },
    { name: "Mentoring", level: 88 },
    { name: "JavaScript", level: 75 },
    { name: "SQL", level: 80 },
    { name: "Groovy", level: 78 },
    { name: "FreeMarker", level: 82 },
    { name: "Artificial Intelligence", level: 65 },
  ],
  tags: [
    "Maven",
    "Docker",
    "Git",
    "SVN",
    "Jenkins",
    "REST",
    "WebServices",
    "SQL",
    "FreeMarker",
    "Groovy",
    "Accessibility",
    "Responsive",
  ],
  projects: [
    {
      id: "piezas",
      label: "mobile · puzzle",
      title: "Piezas",
      description:
        "A puzzle game with your own photos. No ads, no tricks. A personal, relaxing experience designed to enjoy anytime.",
      tech: ["React", "Capacitor", "Native Android"],
      status: "beta",
      statusText: "beta available",
      links: [{ text: "$ view_landing", href: "/piezas-game/", external: true }],
    },
    {
      id: "rpg",
      label: "web · AI · fan project",
      title: "Grand Line RPG",
      description:
        "Narrative role-playing game set in the One Piece universe. LLMs act as adaptive narrators that respond to your choices and build the story in real time.",
      tech: ["React", "LLM API", "Narrative AI"],
      status: "fan",
      statusText: "fan project · non-commercial",
      links: [
        {
          text: "$ play →",
          href: "https://rpg-chat-game.vercel.app",
          external: true,
        },
      ],
    },
  ],
  footerLinks: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/enrique-becerra-garcia/",
    },
    { label: "Email", url: "mailto:quique.ebecerra@gmail.com" },
  ],
};

export function getFallback(locale: Locale): Fallback {
  return locale === "en" ? en : es;
}
