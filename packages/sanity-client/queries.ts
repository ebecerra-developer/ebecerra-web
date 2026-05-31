import { sanityFetch } from "./live";
import type {
  ExperienceItem,
  Skill,
  Project,
  Feature,
  ProcessStep,
  CaseStudy,
  CaseStudySummary,
  CaseStudyMetric,
  HeroSection,
  CapabilitiesSection,
  CapabilityCard,
  ContactForm,
  ContactFormStep,
  ContactField,
  ContactFormBackend,
  ContactFormFieldBackend,
  TechHomeSections,
  TechSiteSettings,
  TechNavItem,
  TechContactForm,
  TechContactFormBackend,
  DemosIndexPage,
  DemosBannerSettings,
  ExamplesPageData,
  BlogPageData,
  BlogCommentForm,
  SiteSettingsMeta,
  SiteSettingsFooter,
  SiteSettingsFull,
  SiteSettingsNavItem,
  FooterCrossLink,
  FooterLegalLink,
  CasesSectionMeta,
  ContactSectionMeta,
  ProfileContact,
  Locale,
  SectionMeta,
  ServiceSectionMeta,
  ServicesPricing,
  FaqPageData,
  FaqItem,
  LegalPageData,
  ProfileFull,
  IntegrationsStrip,
  DemoSite,
  DemoSiteSummary,
  ChatbotConfig,
  BlogAuthor,
  BlogCategory,
  BlogTag,
  PostListItem,
  PostFull,
} from "./types";

// Proyección reutilizable para el objeto chatbot (embebido en profile y demoSite).
const chatbotProjection = (loc: (f: string) => string) => `chatbot {
  "enabled": coalesce(enabled, false),
  "label": ${loc("label")},
  "title": ${loc("title")},
  "greeting": ${loc("greeting")},
  "placeholder": ${loc("placeholder")},
  "systemPrompt": ${loc("systemPrompt")},
  "disclaimers": disclaimers[]{ "v": coalesce(@[$locale], @.es, @) }
}`;

type RawChatbot = Omit<ChatbotConfig, "disclaimers"> & {
  disclaimers: { v: string }[] | null;
};

const normalizeChatbot = (raw: RawChatbot | null): ChatbotConfig | null => {
  if (!raw) return null;
  return {
    ...raw,
    disclaimers: (raw.disclaimers ?? []).map((d) => d.v).filter(Boolean),
  };
};

// coalesce(field[$locale], field.es, field) → soporta:
//  1. { es, en } (nuevo formato localeString) con fallback a ES
//  2. string plano (legacy, durante migración) — field no es objeto, field[$locale] y field.es son null, coalesce devuelve field tal cual.
const loc = (field: string) =>
  `coalesce(${field}[$locale], ${field}.es, ${field})`;

// Wrapper que preserva la firma de client.fetch<T>(query, params) pero pasa por
// sanityFetch del defineLive: en Draft Mode las strings llegan con stega
// encoding para los overlays de Visual Editing, y SanityLive puede invalidar
// las queries vivas al detectar mutaciones.
async function runFetch<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const { data } = await sanityFetch({ query, params });
  return data as T;
}

export async function getSiteData(locale: Locale) {
  const params = { locale };

  const [experienceItemsRaw, skillItems, techTagItems, projectItems, profileData] =
    await Promise.all([
      runFetch<Array<Omit<ExperienceItem, "tech"> & { tech: { v: string }[] | null }>>(
        `*[_type == "experience"] | order(order asc) {
          company,
          "role": ${loc("role")},
          period,
          tag,
          "desc": ${loc("desc")},
          "tech": tech[]{ "v": coalesce(@[$locale], @.es, @) }
        }`,
        params
      ),
      runFetch<Skill[]>(
        `*[_type == "skill"] | order(order asc) {
          "name": ${loc("name")},
          level
        }`,
        params
      ),
      runFetch<{ name: string }[]>(
        `*[_type == "techTag"] | order(order asc) {
          "name": ${loc("name")}
        }`,
        params
      ),
      runFetch<(Omit<Project, "id"> & { id: { current: string } })[]>(
        `*[_type == "project"] | order(order asc) {
          "id": id.current,
          label,
          "title": ${loc("title")},
          "description": ${loc("description")},
          tech,
          status,
          "statusText": ${loc("statusText")},
          "links": links[]{
            "text": ${loc("text")},
            href,
            external
          }
        }`,
        params
      ),
      runFetch<{ aboutFeatures: Feature[] } | null>(
        `*[_type == "profile"][0] {
          "aboutFeatures": aboutFeatures[]{
            icon,
            "label": ${loc("label")},
            "desc": ${loc("desc")}
          }
        }`,
        params
      ),
    ]);

  const experienceItems: ExperienceItem[] = experienceItemsRaw.map((e) => ({
    ...e,
    tech: (e.tech ?? []).map((t) => t.v),
  }));

  return {
    experience: experienceItems.length > 0 ? experienceItems : null,
    skills: skillItems.length > 0 ? skillItems : null,
    tags:
      techTagItems.length > 0 ? techTagItems.map((t) => t.name) : null,
    projects:
      projectItems.length > 0
        ? (projectItems as unknown as Project[])
        : null,
    aboutFeatures:
      profileData?.aboutFeatures?.length ? profileData.aboutFeatures : null,
  };
}

// --- Fase A2: heroSection, siteSettings, profileContact ---

export async function getHeroSection(locale: Locale): Promise<HeroSection | null> {
  type Raw = Omit<HeroSection, "trustBadges"> & { trustBadges: { v: string }[] | null };
  const raw = await runFetch<Raw | null>(
    `*[_type == "heroSection"][0] {
      "kicker": ${loc("kicker")},
      "title": ${loc("title")},
      "lead": ${loc("lead")},
      "ctaPrimary": ${loc("ctaPrimary")},
      "ctaSecondary": ${loc("ctaSecondary")},
      "trustBadges": trustBadges[]{ "v": coalesce(@[$locale], @.es, @) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, trustBadges: (raw.trustBadges ?? []).map((b) => b.v).filter(Boolean) };
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsMeta | null> {
  type Raw = Omit<SiteSettingsMeta, "keywords"> & { keywords: { v: string }[] | null };
  const raw = await runFetch<Raw | null>(
    `*[_type == "siteSettings"][0].metadata {
      "title": ${loc("title")},
      titleTemplate,
      "description": ${loc("description")},
      "ogDescription": ${loc("ogDescription")},
      "twitterDescription": ${loc("twitterDescription")},
      "keywords": keywords[]{ "v": coalesce(@[$locale], @.es, @) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, keywords: (raw.keywords ?? []).map((k) => k.v).filter(Boolean) };
}

export async function getSiteSettingsFooter(locale: Locale): Promise<SiteSettingsFooter | null> {
  type Raw = Omit<SiteSettingsFooter, "socialLinks"> & { socialLinks: { name: string; url: string; external: boolean }[] | null };
  const raw = await runFetch<Raw | null>(
    `*[_type == "siteSettings"][0].footer {
      "tagline": ${loc("tagline")},
      "availability": ${loc("availability")},
      email,
      "socialLinks": socialLinks[]{ name, url, "external": coalesce(external, true) }
    }`,
    { locale }
  );
  if (!raw) return null;
  return { ...raw, socialLinks: raw.socialLinks ?? [] };
}

export async function getProfileContact(locale: Locale): Promise<ProfileContact | null> {
  return runFetch<ProfileContact | null>(
    `*[_type == "profile"][0].contact {
      email,
      linkedinUrl,
      "location": ${loc("location")},
      "responseTime": ${loc("responseTime")}
    }`,
    { locale }
  );
}

// --- Fase 6+: processSteps, caseStudies ---

export async function getProcessSteps(locale: Locale): Promise<ProcessStep[]> {
  return runFetch<ProcessStep[]>(
    `*[_type == "processStep"] | order(order asc) {
      "_id": _id,
      "title": ${loc("title")},
      "description": ${loc("description")},
      icon,
      order
    }`,
    { locale }
  );
}

const caseStudySummaryProjection = `{
  "_id": _id,
  "title": ${loc("title")},
  "slug": slug.current,
  client,
  "clientAnonymized": coalesce(clientAnonymized, false),
  year,
  "summary": ${loc("summary")},
  cover,
  "featured": coalesce(featured, false)
}`;

export async function getCaseStudies(locale: Locale): Promise<CaseStudySummary[]> {
  return runFetch<CaseStudySummary[]>(
    `*[_type == "caseStudy"] | order(coalesce(order, 9999) asc, year desc) ${caseStudySummaryProjection}`,
    { locale }
  );
}

export async function getFeaturedCaseStudies(
  locale: Locale,
  limit = 3
): Promise<CaseStudySummary[]> {
  return runFetch<CaseStudySummary[]>(
    `*[_type == "caseStudy" && featured == true] | order(coalesce(order, 9999) asc, year desc) [0...$limit] ${caseStudySummaryProjection}`,
    { locale, limit }
  );
}

/**
 * Caso destacado para la home con métricas incluidas. Devuelve el
 * primer caso marcado como featured (por orden) o `null` si no hay
 * ninguno publicado. La home muestra un placeholder cuando es null.
 */
export async function getFeaturedCaseForHome(
  locale: Locale
): Promise<(CaseStudySummary & { metrics: CaseStudyMetric[] }) | null> {
  const result = await runFetch<
    (CaseStudySummary & { metrics: CaseStudyMetric[] }) | null
  >(
    `*[_type == "caseStudy" && featured == true] | order(coalesce(order, 9999) asc, year desc) [0] {
      "_id": _id,
      "title": ${loc("title")},
      "slug": slug.current,
      client,
      "clientAnonymized": coalesce(clientAnonymized, false),
      year,
      "summary": ${loc("summary")},
      cover,
      "featured": coalesce(featured, false),
      "metrics": metrics[]{
        "label": ${loc("label")},
        value
      }
    }`,
    { locale }
  );
  return result;
}

/**
 * Features "Sobre mí" desde el singleton `profile`.
 * Devuelve `null` si no hay documento de perfil publicado — la home
 * entonces usa el fallback local.
 */
export async function getProfileFeatures(
  locale: Locale
): Promise<Feature[] | null> {
  const profile = await runFetch<{ aboutFeatures: Feature[] } | null>(
    `*[_type == "profile"][0] {
      "aboutFeatures": aboutFeatures[]{
        icon,
        "label": ${loc("label")},
        "desc": ${loc("desc")}
      }
    }`,
    { locale }
  );
  return profile?.aboutFeatures?.length ? profile.aboutFeatures : null;
}

export async function getCaseStudyBySlug(
  slug: string,
  locale: Locale
): Promise<CaseStudy | null> {
  return runFetch<CaseStudy | null>(
    `*[_type == "caseStudy" && slug.current == $slug][0] {
      "_id": _id,
      "title": ${loc("title")},
      "slug": slug.current,
      client,
      "clientAnonymized": coalesce(clientAnonymized, false),
      year,
      "summary": ${loc("summary")},
      "problem": ${loc("problem")},
      "solution": ${loc("solution")},
      "outcome": ${loc("outcome")},
      "metrics": metrics[]{
        "label": ${loc("label")},
        value
      },
      "stack": stack[]->{
        "name": ${loc("name")}
      },
      cover,
      images,
      "body": coalesce(body[$locale], body.es, []),
      "featured": coalesce(featured, false)
    }`,
    { slug, locale }
  );
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return runFetch<string[]>(
    `*[_type == "caseStudy" && defined(slug.current)].slug.current`
  );
}

// --- Fase A4: section metas, faq, legales, profile extendido ---

export async function getSectionMeta(
  type: "processSectionMeta" | "casesSectionMeta" | "contactSectionMeta",
  locale: Locale
): Promise<SectionMeta | null> {
  return runFetch<SectionMeta | null>(
      `*[_type == $type][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")}
      }`,
      { type, locale }
    )
    .catch(() => null);
}

export async function getServiceSectionMeta(
  locale: Locale
): Promise<ServiceSectionMeta | null> {
  return runFetch<ServiceSectionMeta | null>(
      `*[_type == "serviceSectionMeta"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "auditStrip": auditStrip {
          "kicker": ${loc("kicker")},
          "body": ${loc("body")}
        }
      }`,
      { locale }
    )
    .catch(() => null);
}

// --- Cases / Contact section meta con labels ---

export const DEFAULT_CASES_SECTION_META: CasesSectionMeta = {
  kicker: "// Casos destacados",
  title: "Proyectos reales, problemas resueltos",
  lead: "Tres patrones de solución que he llevado de entornos enterprise a negocios de cualquier escala. Los clientes finales se mantienen bajo confidencialidad; puedo dar referencias concretas tras una primera conversación.",
  labels: {
    context: "Contexto",
    solution: "Solución",
    result: "Resultado",
    translates: "Traducible a tu negocio",
  },
};

export async function getCasesSectionMeta(
  locale: Locale
): Promise<CasesSectionMeta> {
  const raw = await runFetch<CasesSectionMeta | null>(
      `*[_type == "casesSectionMeta"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "labels": labels {
          "context": ${loc("context")},
          "solution": ${loc("solution")},
          "result": ${loc("result")},
          "translates": ${loc("translates")}
        }
      }`,
      { locale }
    )
    .catch(() => null);
  if (!raw) return DEFAULT_CASES_SECTION_META;
  return {
    kicker: raw.kicker ?? DEFAULT_CASES_SECTION_META.kicker,
    title: raw.title ?? DEFAULT_CASES_SECTION_META.title,
    lead: raw.lead ?? DEFAULT_CASES_SECTION_META.lead,
    labels: {
      context:
        raw.labels?.context ?? DEFAULT_CASES_SECTION_META.labels!.context,
      solution:
        raw.labels?.solution ?? DEFAULT_CASES_SECTION_META.labels!.solution,
      result:
        raw.labels?.result ?? DEFAULT_CASES_SECTION_META.labels!.result,
      translates:
        raw.labels?.translates ??
        DEFAULT_CASES_SECTION_META.labels!.translates,
    },
  };
}

// --- Contact form (wizard editable) ---

export const DEFAULT_CONTACT_FORM: ContactForm = {
  steps: [
    {
      _id: "default-step-1",
      stepIndex: 1,
      title: null,
      description: null,
      kind: "fields",
      note: null,
      footnote: null,
      fields: [
        {
          key: "s1_name",
          type: "text",
          label: "Nombre",
          helper: null,
          placeholder: "Cómo te llamas",
          required: true,
          columns: 1,
          autoComplete: "name",
          inputMode: "text",
          options: [],
        },
        {
          key: "s1_email",
          type: "email",
          label: "Email",
          helper: null,
          placeholder: "tu@correo.com",
          required: true,
          columns: 1,
          autoComplete: "email",
          inputMode: "email",
          options: [],
        },
        {
          key: "s1_message",
          type: "textarea",
          label: "Mensaje",
          helper: null,
          placeholder: "Cuéntame brevemente qué necesitas",
          required: true,
          columns: 1,
          autoComplete: null,
          inputMode: null,
          options: [],
        },
      ],
    },
  ],
  submitLabel: "Enviar mensaje",
  sendingLabel: "Enviando…",
  gdprLabel:
    "Al enviar este formulario aceptas la política de privacidad. Tus datos solo se usan para responderte.",
  honeypotLabel: "Website (no rellenar)",
  successMessage: "Mensaje enviado. Te respondo en 24 h laborables.",
  errorMessage:
    "Error al enviar. Prueba escribiéndome a contacto@ebecerra.es.",
  missingRequiredMessage: "Faltan campos obligatorios.",
};

export async function getContactForm(locale: Locale): Promise<ContactForm> {
  type RawOption = {
    value: string | null;
    code: string | null;
    sub: string | null;
  };
  type RawField = {
    key: string | null;
    type: ContactField["type"] | null;
    label: string | null;
    helper: string | null;
    placeholder: string | null;
    required: boolean | null;
    columns: number | null;
    autoComplete: string | null;
    inputMode: string | null;
    options: RawOption[] | null;
  };
  type RawStep = {
    _id: string;
    stepIndex: number | null;
    title: string | null;
    description: string | null;
    kind: ContactFormStep["kind"] | null;
    note: string | null;
    footnote: string | null;
    fields: RawField[] | null;
  };
  type Raw = {
    steps: RawStep[] | null;
    submitLabel: string | null;
    sendingLabel: string | null;
    gdprLabel: string | null;
    honeypotLabel: string | null;
    successMessage: string | null;
    errorMessage: string | null;
    missingRequiredMessage: string | null;
  };

  const raw = await runFetch<Raw | null>(
      `*[_type == "contactFormSettings"][0] {
        "steps": steps[]->{
          _id,
          stepIndex,
          "title": ${loc("title")},
          "description": ${loc("description")},
          kind,
          "note": ${loc("note")},
          "footnote": ${loc("footnote")},
          "fields": fields[]{
            key,
            type,
            "label": ${loc("label")},
            "helper": ${loc("helper")},
            "placeholder": ${loc("placeholder")},
            "required": coalesce(required, false),
            "columns": coalesce(columns, 1),
            autoComplete,
            inputMode,
            "options": options[]{
              "value": ${loc("value")},
              code,
              "sub": ${loc("sub")}
            }
          }
        },
        "submitLabel": ${loc("submitLabel")},
        "sendingLabel": ${loc("sendingLabel")},
        "gdprLabel": ${loc("gdprLabel")},
        "honeypotLabel": ${loc("honeypotLabel")},
        "successMessage": ${loc("successMessage")},
        "errorMessage": ${loc("errorMessage")},
        "missingRequiredMessage": ${loc("missingRequiredMessage")}
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return DEFAULT_CONTACT_FORM;

  const steps: ContactFormStep[] =
    raw.steps && raw.steps.length > 0
      ? raw.steps.map((s) => ({
          _id: s._id,
          stepIndex: s.stepIndex ?? 1,
          title: s.title,
          description: s.description,
          kind: s.kind ?? "fields",
          note: s.note,
          footnote: s.footnote,
          fields: (s.fields ?? [])
            .filter(
              (f): f is RawField & { key: string; type: ContactField["type"]; label: string } =>
                !!f.key && !!f.type && !!f.label
            )
            .map((f) => ({
              key: f.key,
              type: f.type,
              label: f.label,
              helper: f.helper,
              placeholder: f.placeholder,
              required: f.required ?? false,
              columns: ((f.columns ?? 1) as 1 | 2 | 3),
              autoComplete: f.autoComplete,
              inputMode: f.inputMode,
              options: (f.options ?? [])
                .filter((o): o is RawOption & { value: string } => !!o.value)
                .map((o) => ({
                  value: o.value,
                  code: o.code ?? o.value,
                  sub: o.sub,
                })),
            })),
        }))
      : DEFAULT_CONTACT_FORM.steps;

  return {
    steps,
    submitLabel: raw.submitLabel ?? DEFAULT_CONTACT_FORM.submitLabel,
    sendingLabel: raw.sendingLabel ?? DEFAULT_CONTACT_FORM.sendingLabel,
    gdprLabel: raw.gdprLabel ?? DEFAULT_CONTACT_FORM.gdprLabel,
    honeypotLabel:
      raw.honeypotLabel ?? DEFAULT_CONTACT_FORM.honeypotLabel,
    successMessage:
      raw.successMessage ?? DEFAULT_CONTACT_FORM.successMessage,
    errorMessage: raw.errorMessage ?? DEFAULT_CONTACT_FORM.errorMessage,
    missingRequiredMessage:
      raw.missingRequiredMessage ??
      DEFAULT_CONTACT_FORM.missingRequiredMessage,
  };
}

// Proyección barata para el backend: solo lo necesario para validar
// required y mapear options.code. Sin labels, sin stega. Cacheable.
export async function getContactFormBackend(): Promise<ContactFormBackend> {
  type RawOpt = { code: string | null; value: string | null };
  type RawField = {
    key: string | null;
    type: ContactField["type"] | null;
    required: boolean | null;
    options: RawOpt[] | null;
  };
  type Raw = { steps: { fields: RawField[] | null }[] | null };

  const raw = await runFetch<Raw | null>(
    `*[_type == "contactFormSettings"][0] {
      "steps": steps[]->{
        "fields": fields[]{
          key,
          type,
          "required": coalesce(required, false),
          "options": options[]{
            code,
            "value": value.es
          }
        }
      }
    }`,
    {}
  ).catch(() => null);

  if (!raw || !raw.steps) {
    return {
      fields: DEFAULT_CONTACT_FORM.steps.flatMap((s) =>
        s.fields.map((f) => ({
          key: f.key,
          type: f.type,
          required: f.required,
          options: f.options.map((o) => ({ code: o.code })),
        }))
      ),
    };
  }

  const fields: ContactFormFieldBackend[] = raw.steps
    .flatMap((s) => s.fields ?? [])
    .filter(
      (f): f is RawField & { key: string; type: ContactField["type"] } =>
        !!f.key && !!f.type
    )
    .map((f) => ({
      key: f.key,
      type: f.type,
      required: f.required ?? false,
      options: (f.options ?? [])
        .map((o) => ({ code: o.code ?? o.value ?? "" }))
        .filter((o) => o.code),
    }));

  return { fields };
}

// =====================================================
// TECH (ebecerra.tech)
// =====================================================

export const DEFAULT_TECH_HOME_SECTIONS: TechHomeSections = {
  hero: {
    available: "DISPONIBLE",
    firstName: "Enrique",
    lastName: "Becerra",
    tagline:
      "Tech Architect Lead — construyo software que funciona, forma equipos y perdura.",
    ctaContact: "→ contactar",
    ctaProjects: "→ ver proyectos",
    terminal: {
      title: "~/portfolio",
      placeholder: "escribe un comando...",
      cdBlocked: "bash: cd: no puedes escapar de aquí 🔒",
      sudoBlocked: "este portfolio no ejecuta como root 🙅",
      rmBlocked: "rm: operation not permitted (nice try) 😅",
      notFound:
        "comando no encontrado: {cmd}. Escribe 'help' para ver los comandos.",
      lines: {
        whoamiOut: "enrique becerra — tech architect",
        roleOut: "arquitecto de software @ VASS",
        skillsOut: "magnolia_cms, java, architecture",
        statusOut: "abierto a proyectos freelance",
      },
      commands: {
        help: "Comandos: whoami, cat role.txt, ./skills --top, echo $status, pwd, ls, exit, git blame",
        whoami: "enrique becerra — tech architect @ VASS",
        role: "arquitecto de software, formador, geek empedernido",
        skills: "magnolia_cms [98%], java [95%], architecture [90%]",
        status: "abierto a proyectos freelance",
        pwd: "/home/enrique/universe/earth/spain/madrid",
        ls: "proyectos/  skills/  experiencia/  contacto/  easter_eggs/",
        exit: "nice try 😏",
        gitBlame: "todo lo bueno → enrique, todo lo malo → el café",
      },
    },
  },
  about: {
    eyebrow: "// 01. sobre mí",
    title: "Un poco sobre mí 📖",
    bio1:
      "Soy <strong>Tech Architect Leader</strong> con más de 8 años de experiencia, especializado en <strong>Magnolia CMS</strong>, Java y Spring. Actualmente lidero equipos técnicos en VASS y coordino el gremio <strong>VassNolia</strong> en VASS University.",
    bio2:
      "Mi trabajo abarca toma de requisitos, análisis, estimación y desarrollo end-to-end, asegurando que lo técnico encaje con lo que el cliente necesita. He diseñado plantillas y componentes escalables en Magnolia, integrado sistemas vía REST y modernizado legacy con migraciones — mayoritariamente para administración pública y grandes corporaciones.",
    bio3:
      "Fuera del trabajo: geek, curioso crónico, y alguien que también sabe que hay vida más allá del teclado.",
  },
  experience: {
    eyebrow: "// 02. experiencia",
    title: "Trayectoria 🚀",
  },
  skills: {
    eyebrow: "// 03. skills",
    title: "Stack técnico 💡",
  },
  projects: {
    eyebrow: "// 04. proyectos",
    title: "Proyectos propios",
  },
  contact: {
    eyebrow: "// 05. contacto",
    title: "Hablemos 💌",
    description:
      "¿Tienes un proyecto interesante, una idea o simplemente quieres conectar? Escríbeme.",
  },
};

export async function getTechHomeSections(
  locale: Locale
): Promise<TechHomeSections> {
  const raw = await runFetch<TechHomeSections | null>(
    `*[_type == "techHomeSections"][0] {
      "hero": hero {
        "available": ${loc("available")},
        firstName,
        lastName,
        "tagline": ${loc("tagline")},
        "ctaContact": ${loc("ctaContact")},
        "ctaProjects": ${loc("ctaProjects")},
        "terminal": terminal {
          title,
          "placeholder": ${loc("placeholder")},
          "cdBlocked": ${loc("cdBlocked")},
          "sudoBlocked": ${loc("sudoBlocked")},
          "rmBlocked": ${loc("rmBlocked")},
          "notFound": ${loc("notFound")},
          "lines": lines {
            "whoamiOut": ${loc("whoamiOut")},
            "roleOut": ${loc("roleOut")},
            "skillsOut": ${loc("skillsOut")},
            "statusOut": ${loc("statusOut")}
          },
          "commands": commands {
            "help": ${loc("help")},
            "whoami": ${loc("whoami")},
            "role": ${loc("role")},
            "skills": ${loc("skills")},
            "status": ${loc("status")},
            "pwd": ${loc("pwd")},
            "ls": ${loc("ls")},
            "exit": ${loc("exit")},
            "gitBlame": ${loc("gitBlame")}
          }
        }
      },
      "about": about {
        "eyebrow": ${loc("eyebrow")},
        "title": ${loc("title")},
        "bio1": ${loc("bio1")},
        "bio2": ${loc("bio2")},
        "bio3": ${loc("bio3")}
      },
      "experience": experience {
        "eyebrow": ${loc("eyebrow")},
        "title": ${loc("title")}
      },
      "skills": skills {
        "eyebrow": ${loc("eyebrow")},
        "title": ${loc("title")}
      },
      "projects": projects {
        "eyebrow": ${loc("eyebrow")},
        "title": ${loc("title")}
      },
      "contact": contact {
        "eyebrow": ${loc("eyebrow")},
        "title": ${loc("title")},
        "description": ${loc("description")}
      }
    }`,
    { locale }
  ).catch(() => null);

  if (!raw) return DEFAULT_TECH_HOME_SECTIONS;
  // Merge campo a campo con el fallback (cada campo vacío en Sanity cae al fallback)
  const d = DEFAULT_TECH_HOME_SECTIONS;
  return {
    hero: {
      available: raw.hero?.available ?? d.hero.available,
      firstName: raw.hero?.firstName ?? d.hero.firstName,
      lastName: raw.hero?.lastName ?? d.hero.lastName,
      tagline: raw.hero?.tagline ?? d.hero.tagline,
      ctaContact: raw.hero?.ctaContact ?? d.hero.ctaContact,
      ctaProjects: raw.hero?.ctaProjects ?? d.hero.ctaProjects,
      terminal: {
        title: raw.hero?.terminal?.title ?? d.hero.terminal.title,
        placeholder:
          raw.hero?.terminal?.placeholder ?? d.hero.terminal.placeholder,
        cdBlocked: raw.hero?.terminal?.cdBlocked ?? d.hero.terminal.cdBlocked,
        sudoBlocked:
          raw.hero?.terminal?.sudoBlocked ?? d.hero.terminal.sudoBlocked,
        rmBlocked: raw.hero?.terminal?.rmBlocked ?? d.hero.terminal.rmBlocked,
        notFound: raw.hero?.terminal?.notFound ?? d.hero.terminal.notFound,
        lines: {
          whoamiOut:
            raw.hero?.terminal?.lines?.whoamiOut ??
            d.hero.terminal.lines.whoamiOut,
          roleOut:
            raw.hero?.terminal?.lines?.roleOut ?? d.hero.terminal.lines.roleOut,
          skillsOut:
            raw.hero?.terminal?.lines?.skillsOut ??
            d.hero.terminal.lines.skillsOut,
          statusOut:
            raw.hero?.terminal?.lines?.statusOut ??
            d.hero.terminal.lines.statusOut,
        },
        commands: {
          help: raw.hero?.terminal?.commands?.help ?? d.hero.terminal.commands.help,
          whoami:
            raw.hero?.terminal?.commands?.whoami ??
            d.hero.terminal.commands.whoami,
          role: raw.hero?.terminal?.commands?.role ?? d.hero.terminal.commands.role,
          skills:
            raw.hero?.terminal?.commands?.skills ??
            d.hero.terminal.commands.skills,
          status:
            raw.hero?.terminal?.commands?.status ??
            d.hero.terminal.commands.status,
          pwd: raw.hero?.terminal?.commands?.pwd ?? d.hero.terminal.commands.pwd,
          ls: raw.hero?.terminal?.commands?.ls ?? d.hero.terminal.commands.ls,
          exit: raw.hero?.terminal?.commands?.exit ?? d.hero.terminal.commands.exit,
          gitBlame:
            raw.hero?.terminal?.commands?.gitBlame ??
            d.hero.terminal.commands.gitBlame,
        },
      },
    },
    about: {
      eyebrow: raw.about?.eyebrow ?? d.about.eyebrow,
      title: raw.about?.title ?? d.about.title,
      bio1: raw.about?.bio1 ?? d.about.bio1,
      bio2: raw.about?.bio2 ?? d.about.bio2,
      bio3: raw.about?.bio3 ?? d.about.bio3,
    },
    experience: {
      eyebrow: raw.experience?.eyebrow ?? d.experience.eyebrow,
      title: raw.experience?.title ?? d.experience.title,
    },
    skills: {
      eyebrow: raw.skills?.eyebrow ?? d.skills.eyebrow,
      title: raw.skills?.title ?? d.skills.title,
    },
    projects: {
      eyebrow: raw.projects?.eyebrow ?? d.projects.eyebrow,
      title: raw.projects?.title ?? d.projects.title,
    },
    contact: {
      eyebrow: raw.contact?.eyebrow ?? d.contact.eyebrow,
      title: raw.contact?.title ?? d.contact.title,
      description: raw.contact?.description ?? d.contact.description,
    },
  };
}

export const DEFAULT_TECH_SITE_SETTINGS: TechSiteSettings = {
  metadata: {
    title:
      "Enrique Becerra — Tech Architect Lead · Magnolia CMS, Java, Next.js",
    titleTemplate: "%s · ebecerra.tech",
    description:
      "Tech Architect Lead en VASS con 8+ años de experiencia en Magnolia CMS, Java/Spring, Next.js y arquitecturas web a escala enterprise. Coordinador del gremio VassNolia.",
    ogDescription:
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. 8+ años diseñando arquitecturas web para administración pública y grandes corporaciones.",
    twitterDescription:
      "Tech Architect Lead · Magnolia CMS · Java · Next.js. Arquitecturas web enterprise.",
    keywords: [],
  },
  nav: {
    items: [
      { key: "home", label: "./home" },
      { key: "quien_soy", label: "./quien_soy" },
      { key: "trayectoria", label: "./trayectoria" },
      { key: "stack", label: "./stack" },
      { key: "proyectos", label: "./proyectos" },
      { key: "contactar", label: "./contactar" },
    ],
  },
  footer: {
    copyrightTemplate:
      "© {year} ebecerra.tech — hecho con ❤️ y con un poco de 🔍 y 🧪",
    online: "online",
    version: "v2.0.0",
  },
};

export async function getTechSiteSettings(
  locale: Locale
): Promise<TechSiteSettings> {
  type RawNav = { key: string; label: string | null };
  type Raw = {
    metadata: {
      title: string | null;
      titleTemplate: string | null;
      description: string | null;
      ogDescription: string | null;
      twitterDescription: string | null;
      keywords: { v: string }[] | null;
    } | null;
    nav: { items: RawNav[] | null } | null;
    footer: {
      copyrightTemplate: string | null;
      online: string | null;
      version: string | null;
    } | null;
  };

  const raw = await runFetch<Raw | null>(
    `*[_type == "techSiteSettings"][0] {
      "metadata": metadata {
        "title": ${loc("title")},
        titleTemplate,
        "description": ${loc("description")},
        "ogDescription": ${loc("ogDescription")},
        "twitterDescription": ${loc("twitterDescription")},
        "keywords": keywords[]{ "v": coalesce(@[$locale], @.es, @) }
      },
      "nav": nav {
        "items": items[]{
          key,
          "label": ${loc("label")}
        }
      },
      "footer": footer {
        "copyrightTemplate": ${loc("copyrightTemplate")},
        "online": ${loc("online")},
        version
      }
    }`,
    { locale }
  ).catch(() => null);

  if (!raw) return DEFAULT_TECH_SITE_SETTINGS;
  const d = DEFAULT_TECH_SITE_SETTINGS;
  const navItems: TechNavItem[] =
    raw.nav?.items && raw.nav.items.length > 0
      ? raw.nav.items
          .filter((it): it is RawNav & { label: string } => !!it.label)
          .map((it) => ({ key: it.key, label: it.label }))
      : d.nav.items;

  return {
    metadata: {
      title: raw.metadata?.title ?? d.metadata.title,
      titleTemplate: raw.metadata?.titleTemplate ?? d.metadata.titleTemplate,
      description: raw.metadata?.description ?? d.metadata.description,
      ogDescription: raw.metadata?.ogDescription ?? d.metadata.ogDescription,
      twitterDescription:
        raw.metadata?.twitterDescription ?? d.metadata.twitterDescription,
      keywords: (raw.metadata?.keywords ?? []).map((k) => k.v).filter(Boolean),
    },
    nav: { items: navItems },
    footer: {
      copyrightTemplate:
        raw.footer?.copyrightTemplate ?? d.footer.copyrightTemplate,
      online: raw.footer?.online ?? d.footer.online,
      version: raw.footer?.version ?? d.footer.version,
    },
  };
}

// Tech contact form — mismo shape que ContactForm, query separada para
// el documento techContactFormSettings con refs a techContactFormStep.
export const DEFAULT_TECH_CONTACT_FORM: TechContactForm = {
  steps: [
    {
      _id: "default-tech-step-1",
      stepIndex: 1,
      title: null,
      description: null,
      kind: "fields",
      note: null,
      footnote: null,
      fields: [
        {
          key: "s1_name",
          type: "text",
          label: "Tu nombre",
          helper: null,
          placeholder: "Tu nombre",
          required: true,
          columns: 1,
          autoComplete: "name",
          inputMode: "text",
          options: [],
        },
        {
          key: "s1_email",
          type: "email",
          label: "Email",
          helper: null,
          placeholder: "tu@email.com",
          required: true,
          columns: 1,
          autoComplete: "email",
          inputMode: "email",
          options: [],
        },
        {
          key: "s1_message",
          type: "textarea",
          label: "Mensaje",
          helper: null,
          placeholder: "Cuéntame...",
          required: true,
          columns: 1,
          autoComplete: null,
          inputMode: null,
          options: [],
        },
      ],
    },
  ],
  submitLabel: "$ enviar_mensaje →",
  sendingLabel: "Enviando...",
  gdprLabel:
    "Al enviar este formulario aceptas la política de privacidad. Tus datos solo se usan para responderte.",
  honeypotLabel: "Website (no rellenar)",
  successMessage: "Mensaje enviado correctamente. ¡Gracias!",
  errorMessage: "Error al enviar el mensaje. Inténtalo de nuevo.",
  missingRequiredMessage: "Faltan campos obligatorios.",
};

export async function getTechContactForm(
  locale: Locale
): Promise<TechContactForm> {
  type RawOption = { value: string | null; code: string | null; sub: string | null };
  type RawField = {
    key: string | null;
    type: ContactField["type"] | null;
    label: string | null;
    helper: string | null;
    placeholder: string | null;
    required: boolean | null;
    columns: number | null;
    autoComplete: string | null;
    inputMode: string | null;
    options: RawOption[] | null;
  };
  type RawStep = {
    _id: string;
    stepIndex: number | null;
    title: string | null;
    description: string | null;
    kind: ContactFormStep["kind"] | null;
    note: string | null;
    footnote: string | null;
    fields: RawField[] | null;
  };
  type Raw = {
    steps: RawStep[] | null;
    submitLabel: string | null;
    sendingLabel: string | null;
    gdprLabel: string | null;
    honeypotLabel: string | null;
    successMessage: string | null;
    errorMessage: string | null;
    missingRequiredMessage: string | null;
  };

  const raw = await runFetch<Raw | null>(
    `*[_type == "techContactFormSettings"][0] {
      "steps": steps[]->{
        _id,
        stepIndex,
        "title": ${loc("title")},
        "description": ${loc("description")},
        kind,
        "note": ${loc("note")},
        "footnote": ${loc("footnote")},
        "fields": fields[]{
          key,
          type,
          "label": ${loc("label")},
          "helper": ${loc("helper")},
          "placeholder": ${loc("placeholder")},
          "required": coalesce(required, false),
          "columns": coalesce(columns, 1),
          autoComplete,
          inputMode,
          "options": options[]{
            "value": ${loc("value")},
            code,
            "sub": ${loc("sub")}
          }
        }
      },
      "submitLabel": ${loc("submitLabel")},
      "sendingLabel": ${loc("sendingLabel")},
      "gdprLabel": ${loc("gdprLabel")},
      "honeypotLabel": ${loc("honeypotLabel")},
      "successMessage": ${loc("successMessage")},
      "errorMessage": ${loc("errorMessage")},
      "missingRequiredMessage": ${loc("missingRequiredMessage")}
    }`,
    { locale }
  ).catch(() => null);

  if (!raw) return DEFAULT_TECH_CONTACT_FORM;
  const d = DEFAULT_TECH_CONTACT_FORM;

  const steps: ContactFormStep[] =
    raw.steps && raw.steps.length > 0
      ? raw.steps.map((s) => ({
          _id: s._id,
          stepIndex: s.stepIndex ?? 1,
          title: s.title,
          description: s.description,
          kind: s.kind ?? "fields",
          note: s.note,
          footnote: s.footnote,
          fields: (s.fields ?? [])
            .filter(
              (f): f is RawField & { key: string; type: ContactField["type"]; label: string } =>
                !!f.key && !!f.type && !!f.label
            )
            .map((f) => ({
              key: f.key,
              type: f.type,
              label: f.label,
              helper: f.helper,
              placeholder: f.placeholder,
              required: f.required ?? false,
              columns: ((f.columns ?? 1) as 1 | 2 | 3),
              autoComplete: f.autoComplete,
              inputMode: f.inputMode,
              options: (f.options ?? [])
                .filter((o): o is RawOption & { value: string } => !!o.value)
                .map((o) => ({ value: o.value, code: o.code ?? o.value, sub: o.sub })),
            })),
        }))
      : d.steps;

  return {
    steps,
    submitLabel: raw.submitLabel ?? d.submitLabel,
    sendingLabel: raw.sendingLabel ?? d.sendingLabel,
    gdprLabel: raw.gdprLabel ?? d.gdprLabel,
    honeypotLabel: raw.honeypotLabel ?? d.honeypotLabel,
    successMessage: raw.successMessage ?? d.successMessage,
    errorMessage: raw.errorMessage ?? d.errorMessage,
    missingRequiredMessage:
      raw.missingRequiredMessage ?? d.missingRequiredMessage,
  };
}

export async function getTechContactFormBackend(): Promise<TechContactFormBackend> {
  type RawOpt = { code: string | null; value: string | null };
  type RawField = {
    key: string | null;
    type: ContactField["type"] | null;
    required: boolean | null;
    options: RawOpt[] | null;
  };
  type Raw = { steps: { fields: RawField[] | null }[] | null };

  const raw = await runFetch<Raw | null>(
    `*[_type == "techContactFormSettings"][0] {
      "steps": steps[]->{
        "fields": fields[]{
          key,
          type,
          "required": coalesce(required, false),
          "options": options[]{
            code,
            "value": value.es
          }
        }
      }
    }`,
    {}
  ).catch(() => null);

  if (!raw || !raw.steps) {
    return {
      fields: DEFAULT_TECH_CONTACT_FORM.steps.flatMap((s) =>
        s.fields.map((f) => ({
          key: f.key,
          type: f.type,
          required: f.required,
          options: f.options.map((o) => ({ code: o.code })),
        }))
      ),
    };
  }

  const fields: ContactFormFieldBackend[] = raw.steps
    .flatMap((s) => s.fields ?? [])
    .filter(
      (f): f is RawField & { key: string; type: ContactField["type"] } =>
        !!f.key && !!f.type
    )
    .map((f) => ({
      key: f.key,
      type: f.type,
      required: f.required ?? false,
      options: (f.options ?? [])
        .map((o) => ({ code: o.code ?? o.value ?? "" }))
        .filter((o) => o.code),
    }));

  return { fields };
}

// =====================================================
// DEMOS (demos.ebecerra.es)
// =====================================================

export const DEFAULT_DEMOS_INDEX_PAGE: DemosIndexPage = {
  title: "Demos de webs",
  lead: "Ejemplos navegables de lo que podemos construir para tu negocio.",
  ctaBack: "Volver a ebecerra.es",
};

export async function getDemosIndexPage(
  locale: Locale
): Promise<DemosIndexPage> {
  const raw = await runFetch<Partial<DemosIndexPage> | null>(
    `*[_type == "demosIndexPage"][0] {
      "title": ${loc("title")},
      "lead": ${loc("lead")},
      "ctaBack": ${loc("ctaBack")}
    }`,
    { locale }
  ).catch(() => null);

  return {
    title: raw?.title ?? DEFAULT_DEMOS_INDEX_PAGE.title,
    lead: raw?.lead ?? DEFAULT_DEMOS_INDEX_PAGE.lead,
    ctaBack: raw?.ctaBack ?? DEFAULT_DEMOS_INDEX_PAGE.ctaBack,
  };
}

export const DEFAULT_DEMOS_BANNER: DemosBannerSettings = {
  label: "Demo",
  text: "Esta web es un ejemplo. No representa un negocio real.",
  ctaLabel: "Ver más demos",
  ctaHref: "https://ebecerra.es/ejemplos",
};

export async function getDemosBannerSettings(
  locale: Locale
): Promise<DemosBannerSettings> {
  const raw = await runFetch<Partial<DemosBannerSettings> | null>(
    `*[_type == "demosBannerSettings"][0] {
      "label": ${loc("label")},
      "text": ${loc("text")},
      "ctaLabel": ${loc("ctaLabel")},
      ctaHref
    }`,
    { locale }
  ).catch(() => null);

  return {
    label: raw?.label ?? DEFAULT_DEMOS_BANNER.label,
    text: raw?.text ?? DEFAULT_DEMOS_BANNER.text,
    ctaLabel: raw?.ctaLabel ?? DEFAULT_DEMOS_BANNER.ctaLabel,
    ctaHref: raw?.ctaHref ?? DEFAULT_DEMOS_BANNER.ctaHref,
  };
}

// =====================================================
// BLOG PAGE
// =====================================================

export const DEFAULT_BLOG_PAGE: BlogPageData = {
  metaTitle: "Blog · Web profesional, IA y SEO para autónomos y PYMEs",
  metaDescription:
    "Artículos sobre web profesional, chatbots con IA, SEO y decisiones técnicas para autónomos y PYMEs. Sin jerga, con criterio.",
  kicker: "// BLOG",
  title: "Artículos",
  lead: "Sobre web profesional, IA aplicada al negocio, SEO y decisiones técnicas. Sin jerga, con criterio.",
  empty: "Aún no hay artículos publicados.",
  filterAll: "Todas",
  filterCategory: "Categoría",
  sortNewest: "Más recientes",
  sortOldest: "Más antiguos",
  backToList: "← Volver al blog",
  byPrefix: "por",
  byAuthor: "por {name}",
  publishedOn: "Publicado el {date}",
  updatedOn: "Actualizado el {date}",
  tocLabel: "En este artículo",
  shareLabel: "Compartir",
  relatedHeading: "Artículos relacionados",
  likeLabel: "Me ha gustado",
  likeThanks: "¡Gracias!",
  commentsHeading: "Comentarios",
  commentsEmpty: "Sé el primero en comentar.",
  commentForm: {
    title: "Deja un comentario",
    name: "Nombre",
    email: "Email",
    emailHint: "(opcional, no se publica)",
    body: "Comentario",
    submit: "Enviar",
    submitting: "Enviando…",
    success: "Tu comentario está pendiente de moderación. ¡Gracias!",
    error: "No se pudo enviar. Inténtalo en un momento.",
    privacy: "Los comentarios se revisan antes de publicarse.",
  },
};

export async function getBlogPage(locale: Locale): Promise<BlogPageData> {
  type RawCF = Partial<BlogCommentForm> | null;
  type Raw = Partial<Omit<BlogPageData, "commentForm">> & {
    commentForm: RawCF;
  };

  const raw = await runFetch<Raw | null>(
    `*[_type == "blogPage"][0] {
      "metaTitle": ${loc("metaTitle")},
      "metaDescription": ${loc("metaDescription")},
      "kicker": ${loc("kicker")},
      "title": ${loc("title")},
      "lead": ${loc("lead")},
      "empty": ${loc("empty")},
      "filterAll": ${loc("filterAll")},
      "filterCategory": ${loc("filterCategory")},
      "sortNewest": ${loc("sortNewest")},
      "sortOldest": ${loc("sortOldest")},
      "backToList": ${loc("backToList")},
      "byPrefix": ${loc("byPrefix")},
      "byAuthor": ${loc("byAuthor")},
      "publishedOn": ${loc("publishedOn")},
      "updatedOn": ${loc("updatedOn")},
      "tocLabel": ${loc("tocLabel")},
      "shareLabel": ${loc("shareLabel")},
      "relatedHeading": ${loc("relatedHeading")},
      "likeLabel": ${loc("likeLabel")},
      "likeThanks": ${loc("likeThanks")},
      "commentsHeading": ${loc("commentsHeading")},
      "commentsEmpty": ${loc("commentsEmpty")},
      "commentForm": commentForm {
        "title": ${loc("title")},
        "name": ${loc("name")},
        "email": ${loc("email")},
        "emailHint": ${loc("emailHint")},
        "body": ${loc("body")},
        "submit": ${loc("submit")},
        "submitting": ${loc("submitting")},
        "success": ${loc("success")},
        "error": ${loc("error")},
        "privacy": ${loc("privacy")}
      }
    }`,
    { locale }
  ).catch(() => null);

  const d = DEFAULT_BLOG_PAGE;
  if (!raw) return d;
  const cf = raw.commentForm;
  return {
    metaTitle: raw.metaTitle ?? d.metaTitle,
    metaDescription: raw.metaDescription ?? d.metaDescription,
    kicker: raw.kicker ?? d.kicker,
    title: raw.title ?? d.title,
    lead: raw.lead ?? d.lead,
    empty: raw.empty ?? d.empty,
    filterAll: raw.filterAll ?? d.filterAll,
    filterCategory: raw.filterCategory ?? d.filterCategory,
    sortNewest: raw.sortNewest ?? d.sortNewest,
    sortOldest: raw.sortOldest ?? d.sortOldest,
    backToList: raw.backToList ?? d.backToList,
    byPrefix: raw.byPrefix ?? d.byPrefix,
    byAuthor: raw.byAuthor ?? d.byAuthor,
    publishedOn: raw.publishedOn ?? d.publishedOn,
    updatedOn: raw.updatedOn ?? d.updatedOn,
    tocLabel: raw.tocLabel ?? d.tocLabel,
    shareLabel: raw.shareLabel ?? d.shareLabel,
    relatedHeading: raw.relatedHeading ?? d.relatedHeading,
    likeLabel: raw.likeLabel ?? d.likeLabel,
    likeThanks: raw.likeThanks ?? d.likeThanks,
    commentsHeading: raw.commentsHeading ?? d.commentsHeading,
    commentsEmpty: raw.commentsEmpty ?? d.commentsEmpty,
    commentForm: {
      title: cf?.title ?? d.commentForm.title,
      name: cf?.name ?? d.commentForm.name,
      email: cf?.email ?? d.commentForm.email,
      emailHint: cf?.emailHint ?? d.commentForm.emailHint,
      body: cf?.body ?? d.commentForm.body,
      submit: cf?.submit ?? d.commentForm.submit,
      submitting: cf?.submitting ?? d.commentForm.submitting,
      success: cf?.success ?? d.commentForm.success,
      error: cf?.error ?? d.commentForm.error,
      privacy: cf?.privacy ?? d.commentForm.privacy,
    },
  };
}

// =====================================================
// EXAMPLES PAGE
// =====================================================

export const DEFAULT_EXAMPLES_PAGE: ExamplesPageData = {
  metaTitle: "Ejemplos de webs · Enrique Becerra",
  metaDescription:
    "Demos navegables de webs profesionales para autónomos, PYMEs y pequeños negocios. Mira lo que puedes tener antes de encargar.",
  kicker: "// EJEMPLOS",
  title: "Ejemplos de webs reales para tu negocio",
  lead: "Demos completas para que veas qué puedes tener: agencia de marketing, coaching, clínica de fisioterapia… Cada una con su personalidad y su tono. La tuya nace de una conversación contigo, no de una plantilla.",
  ctaContact: "Empieza con la tuya",
  homeKicker: "// 05. Ejemplos",
  homeTitle: "Mira lo que puedes tener",
  homeLead:
    "Demos completas y navegables de webs como las que entrego a autónomos, pequeños negocios y proyectos personales. Para que veas el resultado antes de encargar.",
  homeViewAll: "Ver todos los ejemplos",
  emptyState: "Demos en preparación. Vuelve pronto.",
  viewDemoLabel: "Ver demo",
  openInNewTabLabel: "(se abre en pestaña nueva)",
  prevLabel: "Ejemplo anterior",
  nextLabel: "Siguiente ejemplo",
};

export async function getExamplesPage(
  locale: Locale
): Promise<ExamplesPageData> {
  const raw = await runFetch<Partial<ExamplesPageData> | null>(
    `*[_type == "examplesPage"][0] {
      "metaTitle": ${loc("metaTitle")},
      "metaDescription": ${loc("metaDescription")},
      "kicker": ${loc("kicker")},
      "title": ${loc("title")},
      "lead": ${loc("lead")},
      "ctaContact": ${loc("ctaContact")},
      "homeKicker": ${loc("homeKicker")},
      "homeTitle": ${loc("homeTitle")},
      "homeLead": ${loc("homeLead")},
      "homeViewAll": ${loc("homeViewAll")},
      "emptyState": ${loc("emptyState")},
      "viewDemoLabel": ${loc("viewDemoLabel")},
      "openInNewTabLabel": ${loc("openInNewTabLabel")},
      "prevLabel": ${loc("prevLabel")},
      "nextLabel": ${loc("nextLabel")}
    }`,
    { locale }
  ).catch(() => null);

  const d = DEFAULT_EXAMPLES_PAGE;
  if (!raw) return d;
  return {
    metaTitle: raw.metaTitle ?? d.metaTitle,
    metaDescription: raw.metaDescription ?? d.metaDescription,
    kicker: raw.kicker ?? d.kicker,
    title: raw.title ?? d.title,
    lead: raw.lead ?? d.lead,
    ctaContact: raw.ctaContact ?? d.ctaContact,
    homeKicker: raw.homeKicker ?? d.homeKicker,
    homeTitle: raw.homeTitle ?? d.homeTitle,
    homeLead: raw.homeLead ?? d.homeLead,
    homeViewAll: raw.homeViewAll ?? d.homeViewAll,
    emptyState: raw.emptyState ?? d.emptyState,
    viewDemoLabel: raw.viewDemoLabel ?? d.viewDemoLabel,
    openInNewTabLabel: raw.openInNewTabLabel ?? d.openInNewTabLabel,
    prevLabel: raw.prevLabel ?? d.prevLabel,
    nextLabel: raw.nextLabel ?? d.nextLabel,
  };
}

export const DEFAULT_CONTACT_SECTION_META: ContactSectionMeta = {
  kicker: "// Contacto",
  title: "Hablemos de tu proyecto",
  lead: "Cuéntame qué necesitas y te respondo en 24 h laborables con una primera idea del alcance.",
  labels: {
    email: "Email",
    linkedin: "LinkedIn",
    location: "Ubicación",
    response: "Respuesta",
  },
};

export async function getContactSectionMeta(
  locale: Locale
): Promise<ContactSectionMeta> {
  const raw = await runFetch<ContactSectionMeta | null>(
      `*[_type == "contactSectionMeta"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "labels": labels {
          "email": ${loc("email")},
          "linkedin": ${loc("linkedin")},
          "location": ${loc("location")},
          "response": ${loc("response")}
        }
      }`,
      { locale }
    )
    .catch(() => null);
  if (!raw) return DEFAULT_CONTACT_SECTION_META;
  return {
    kicker: raw.kicker ?? DEFAULT_CONTACT_SECTION_META.kicker,
    title: raw.title ?? DEFAULT_CONTACT_SECTION_META.title,
    lead: raw.lead ?? DEFAULT_CONTACT_SECTION_META.lead,
    labels: {
      email:
        raw.labels?.email ?? DEFAULT_CONTACT_SECTION_META.labels!.email,
      linkedin:
        raw.labels?.linkedin ??
        DEFAULT_CONTACT_SECTION_META.labels!.linkedin,
      location:
        raw.labels?.location ??
        DEFAULT_CONTACT_SECTION_META.labels!.location,
      response:
        raw.labels?.response ??
        DEFAULT_CONTACT_SECTION_META.labels!.response,
    },
  };
}

// --- Capabilities section (03) ---

export const DEFAULT_CAPABILITIES_SECTION: CapabilitiesSection = {
  kicker: "Más que una web",
  title: "Tecnología que te lleva ventaja",
  lead: "Tu web puede hacer mucho más que estar online. Hablamos de lo que mueve la aguja en tu negocio: atender mejor, ganar tiempo, decidir con datos.",
  items: [
    {
      icon: "🤖",
      badge: "Nuevo",
      featured: true,
      title: "Asistente con IA",
      description:
        "Un chatbot 24/7 entrenado con tu información. Atiende preguntas frecuentes, agenda citas, recoge leads y los manda a tu correo o CRM.",
      bullets: [
        "Responde en tu tono, en varios idiomas",
        "Asistente en el panel para crear textos y traducir",
        "Resúmenes automáticos de reseñas y feedback",
      ],
    },
    {
      icon: "📅",
      badge: null,
      featured: false,
      title: "Reservas online",
      description:
        "Calendario integrado o conexión con Doctoralia, Cal.com, Calendly o el sistema que ya uses. El cliente reserva sin llamar.",
      bullets: [
        "Recordatorios por SMS y WhatsApp",
        "Bloqueos de tiempo entre citas",
        "Pagos online si los necesitas",
      ],
    },
    {
      icon: "🔌",
      badge: null,
      featured: false,
      title: "Integra con todo",
      description:
        "Tu web hablando con las herramientas que ya usas. Sin abrir 5 pestañas para hacer una cosa.",
      bullets: [
        "WhatsApp Business, email marketing, CRM",
        "Pasarelas de pago, Google Maps, redes sociales",
        "Conexión con tu software de gestión",
      ],
    },
    {
      icon: "📊",
      badge: null,
      featured: false,
      title: "Datos para decidir",
      description:
        "Analytics privados (sin Google si no quieres). Sabes qué páginas funcionan, de dónde llegan tus clientes y qué cambiar.",
      bullets: [
        "Panel mensual fácil de leer",
        "Cumplimiento RGPD por defecto",
        "Sin cookies invasivas",
      ],
    },
  ],
  noteLabel: "Importante",
  noteText:
    "Estas capacidades son opcionales y modulares. No tienes que tenerlas todas: empezamos por lo que necesitas hoy y crecemos cuando tu negocio lo pida.",
};

export async function getCapabilitiesSection(
  locale: Locale
): Promise<CapabilitiesSection> {
  type RawCard = {
    icon: string | null;
    badge: string | null;
    featured: boolean | null;
    title: string | null;
    description: string | null;
    bullets: { v: string }[] | null;
  };
  type Raw = Omit<CapabilitiesSection, "items"> & {
    items: RawCard[] | null;
  };

  const raw = await runFetch<Raw | null>(
      `*[_type == "capabilitiesSection"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "items": items[]{
          icon,
          "badge": ${loc("badge")},
          "featured": coalesce(featured, false),
          "title": ${loc("title")},
          "description": ${loc("description")},
          "bullets": bullets[]{ "v": coalesce(@[$locale], @.es, @) }
        },
        "noteLabel": ${loc("noteLabel")},
        "noteText": ${loc("noteText")}
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return DEFAULT_CAPABILITIES_SECTION;

  const items: CapabilityCard[] =
    raw.items && raw.items.length > 0
      ? raw.items
          .filter((it): it is RawCard & { icon: string; title: string; description: string } =>
            !!it.icon && !!it.title && !!it.description
          )
          .map((it) => ({
            icon: it.icon,
            badge: it.badge,
            featured: it.featured ?? false,
            title: it.title,
            description: it.description,
            bullets: (it.bullets ?? []).map((b) => b.v).filter(Boolean),
          }))
      : DEFAULT_CAPABILITIES_SECTION.items;

  return {
    kicker: raw.kicker ?? DEFAULT_CAPABILITIES_SECTION.kicker,
    title: raw.title ?? DEFAULT_CAPABILITIES_SECTION.title,
    lead: raw.lead ?? DEFAULT_CAPABILITIES_SECTION.lead,
    items,
    noteLabel: raw.noteLabel ?? DEFAULT_CAPABILITIES_SECTION.noteLabel,
    noteText: raw.noteText ?? DEFAULT_CAPABILITIES_SECTION.noteText,
  };
}

/**
 * Franja de integraciones (herramientas que integro) de la home apps/es.
 * Singleton. Si no hay documento o está deshabilitado / vacío, el componente
 * Integrations no se renderiza (enabled=false o items=[]).
 */
export async function getIntegrationsStrip(
  locale: Locale
): Promise<IntegrationsStrip> {
  const raw = await runFetch<IntegrationsStrip | null>(
      `*[_type == "integrationsStrip"][0] {
        "enabled": coalesce(enabled, false),
        "heading": ${loc("heading")},
        "items": items[]{
          name,
          "logo": logo{ ..., "alt": alt },
          url
        }
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return { enabled: false, heading: null, items: [] };
  return {
    enabled: raw.enabled ?? false,
    heading: raw.heading ?? null,
    items: (raw.items ?? []).filter((it) => !!it && !!it.name && !!it.logo),
  };
}

/**
 * Singleton con la sección completa de Servicios y precios:
 * caminos × tiers, add-ons, cláusula de rescisión y footnote.
 *
 * Devuelve null si no hay documento publicado — el componente
 * Services debe renderizar un fallback en ese caso.
 */
export async function getServicesPricing(
  locale: Locale
): Promise<ServicesPricing | null> {
  type Raw = Omit<ServicesPricing, "paths" | "addOns"> & {
    paths:
      | Array<
          Omit<ServicesPricing["paths"][number], "tiers"> & {
            tiers:
              | Array<
                  Omit<
                    ServicesPricing["paths"][number]["tiers"][number],
                    "features"
                  > & {
                    features:
                      | ServicesPricing["paths"][number]["tiers"][number]["features"]
                      | null;
                  }
                >
              | null;
          }
        >
      | null;
    addOns: ServicesPricing["addOns"] | null;
  };

  const raw = await runFetch<Raw | null>(
      `*[_type == "servicesPricing"][0] {
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "pathSelectorLabel": ${loc("pathSelectorLabel")},
        "paths": paths[]{
          id,
          "label": ${loc("label")},
          "tagline": ${loc("tagline")},
          "isDefault": coalesce(isDefault, false),
          "tiers": tiers[]{
            id,
            "name": ${loc("name")},
            priceMain,
            "priceSecondary": ${loc("priceSecondary")},
            "conditions": ${loc("conditions")},
            "features": features[]{
              "text": ${loc("text")},
              "highlight": coalesce(highlight, false)
            },
            "highlighted": coalesce(highlighted, false),
            "badge": ${loc("badge")},
            "ctaLabel": ${loc("ctaLabel")},
            ctaHref
          }
        },
        "cancellationClause": cancellationClause {
          showOnPathId,
          "label": ${loc("label")},
          "body": ${loc("body")}
        },
        "addOnsSectionTitle": ${loc("addOnsSectionTitle")},
        "addOnsSectionLead": ${loc("addOnsSectionLead")},
        "addOns": addOns[]{
          "title": ${loc("title")},
          "price": ${loc("price")},
          "note": ${loc("note")}
        },
        "migrationFootnote": ${loc("migrationFootnote")}
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return null;
  return {
    ...raw,
    paths: (raw.paths ?? []).map((p) => ({
      ...p,
      tiers: (p.tiers ?? []).map((t) => ({
        ...t,
        features: (t.features ?? []).map((f) => ({
          text: f.text,
          highlight: Boolean(f.highlight),
        })),
      })),
    })),
    addOns: raw.addOns ?? [],
  };
}

export const DEFAULT_FAQ_PAGE: FaqPageData = {
  metaTitle: "Preguntas frecuentes",
  metaDescription:
    "Plazos, formas de pago, revisiones de diseño, mantenimiento, Kit Digital, NDA y hosting. Lo que suelen preguntarme autónomos y PYMEs antes de arrancar un proyecto web.",
  kicker: "// FAQ",
  title: "Preguntas frecuentes",
  lead: "Lo que suelen preguntarme antes de arrancar. Si lo tuyo no está aquí, escríbeme y te respondo en 24 h laborables.",
  contactSectionTitle: "¿Sigues con dudas?",
  contactSectionLead:
    "Cuéntame tu caso y te doy una primera idea del alcance sin compromiso.",
  contactCta: "Escribirme",
};

export async function getFaqPage(locale: Locale): Promise<FaqPageData> {
  const raw = await runFetch<Partial<FaqPageData> | null>(
      `*[_type == "faqPage"][0] {
        "metaTitle": ${loc("metaTitle")},
        "metaDescription": ${loc("metaDescription")},
        "kicker": ${loc("kicker")},
        "title": ${loc("title")},
        "lead": ${loc("lead")},
        "contactSectionTitle": ${loc("contactSectionTitle")},
        "contactSectionLead": ${loc("contactSectionLead")},
        "contactCta": ${loc("contactCta")}
      }`,
      { locale }
    )
    .catch(() => null);
  const d = DEFAULT_FAQ_PAGE;
  if (!raw) return d;
  return {
    metaTitle: raw.metaTitle ?? d.metaTitle,
    metaDescription: raw.metaDescription ?? d.metaDescription,
    kicker: raw.kicker ?? d.kicker,
    title: raw.title ?? d.title,
    lead: raw.lead ?? d.lead,
    contactSectionTitle: raw.contactSectionTitle ?? d.contactSectionTitle,
    contactSectionLead: raw.contactSectionLead ?? d.contactSectionLead,
    contactCta: raw.contactCta ?? d.contactCta,
  };
}

export async function getFaqItems(locale: Locale): Promise<FaqItem[]> {
  return runFetch<FaqItem[]>(
      `*[_type == "faqItem"] | order(order asc) {
        "_id": _id,
        "question": ${loc("question")},
        "answer": ${loc("answer")},
        order,
        category
      }`,
      { locale }
    )
    .catch(() => []);
}

export async function getLegalPage(
  slug: string,
  locale: Locale
): Promise<LegalPageData | null> {
  return runFetch<LegalPageData | null>(
      `*[_type == "legalPage" && slug.current == $slug][0] {
        "slug": slug.current,
        "title": ${loc("title")},
        "metaDescription": ${loc("metaDescription")},
        "content": coalesce(content[$locale], content.es, []),
        updatedAt
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getLegalPageSlugs(): Promise<string[]> {
  return runFetch<string[]>(
      `*[_type == "legalPage" && defined(slug.current)].slug.current`
    )
    .catch(() => []);
}

export async function getProfile(locale: Locale): Promise<ProfileFull | null> {
  type Raw = Omit<ProfileFull, "chatbot"> & { chatbot: RawChatbot | null };
  const raw = await runFetch<Raw | null>(
      `*[_type == "profile"][0] {
        name,
        "jobTitle": ${loc("jobTitle")},
        "aboutKicker": ${loc("aboutKicker")},
        "aboutTitle": ${loc("aboutTitle")},
        "aboutPhoto": aboutPhoto{ ..., "alt": alt },
        "aboutViewProfileCta": ${loc("aboutViewProfileCta")},
        "bio1": ${loc("bio1")},
        "bio2": ${loc("bio2")},
        "stats": stats[]{
          value,
          "label": ${loc("label")}
        },
        "aboutFeatures": aboutFeatures[]{
          icon,
          "label": ${loc("label")},
          "desc": ${loc("desc")}
        },
        "contact": contact {
          email,
          linkedinUrl,
          "location": ${loc("location")},
          "responseTime": ${loc("responseTime")}
        },
        "chatbot": ${chatbotProjection(loc)}
      }`,
      { locale }
    )
    .catch(() => null);
  if (!raw) return null;
  return { ...raw, chatbot: normalizeChatbot(raw.chatbot) };
}

/**
 * Devuelve la configuración del chatbot del profile singleton.
 *
 * `field`:
 *   - "chatbot"     → bot de ebecerra.es (comercial).
 *   - "chatbotTech" → bot de ebecerra.tech (técnico).
 */
export async function getProfileChatbot(
  locale: Locale,
  field: "chatbot" | "chatbotTech" = "chatbot"
): Promise<ChatbotConfig | null> {
  const raw = await runFetch<RawChatbot | null>(
      `*[_type == "profile"][0].${field} {
        "enabled": coalesce(enabled, false),
        "label": ${loc("label")},
        "title": ${loc("title")},
        "greeting": ${loc("greeting")},
        "placeholder": ${loc("placeholder")},
        "systemPrompt": ${loc("systemPrompt")},
        "disclaimers": disclaimers[]{ "v": coalesce(@[$locale], @.es, @) }
      }`,
      { locale }
    )
    .catch(() => null);
  return normalizeChatbot(raw);
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsFull = {
  metadata: {
    title: "Enrique Becerra — Desarrollo web para autónomos y PYMEs",
    titleTemplate: "%s · eBecerra",
    description:
      "Webs a medida para clínicas, despachos, autónomos y PYMEs. Sin plantillas ni humo. Rápidas, accesibles y pensadas para que tu equipo las mantenga solo.",
    ogDescription:
      "Webs a medida para clínicas, despachos, autónomos y PYMEs. Sin plantillas genéricas ni agencias. Rápidas, accesibles y fáciles de mantener.",
    twitterDescription:
      "Webs a medida para clínicas, despachos y pequeños negocios. Sin plantillas ni humo.",
    keywords: [],
  },
  nav: {
    items: [
      { type: "anchor", key: "servicios", label: "Servicios" },
      { type: "anchor", key: "sobre-mi", label: "Sobre mí" },
      { type: "anchor", key: "capacidades", label: "Capacidades" },
      { type: "anchor", key: "proceso", label: "Proceso" },
      { type: "anchor", key: "ejemplos", label: "Ejemplos" },
      { type: "page", href: "/blog/", label: "Blog" },
      { type: "page", href: "/faq", label: "FAQ" },
      { type: "anchor", key: "contacto", label: "Contacto" },
    ],
    ctaLabel: "Hablemos",
  },
  footer: {
    tagline:
      "Webs a medida para negocios que no se conforman con una plantilla. Rápidas, accesibles, fáciles de mantener y pensadas para que tu equipo opere sin depender de nadie.",
    availability: "disponible para que trabajemos juntos",
    email: "contacto@ebecerra.es",
    colNavTitle: "navegación",
    colSocialTitle: "social",
    colCrossTitle: "ecosistema ebecerra",
    navColumn: [
      { type: "anchor", key: "servicios", label: "Servicios" },
      { type: "anchor", key: "sobre-mi", label: "Sobre mí" },
      { type: "anchor", key: "capacidades", label: "Capacidades" },
      { type: "anchor", key: "proceso", label: "Proceso" },
      { type: "anchor", key: "ejemplos", label: "Ejemplos" },
      { type: "page", href: "/blog/", label: "Blog" },
      { type: "anchor", key: "contacto", label: "Contacto" },
    ],
    socialLinks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/enrique-becerra-garcia/",
        external: true,
      },
    ],
    crossLinks: [
      { label: "ebecerra.tech ↗", href: "https://ebecerra.tech", external: true },
      { label: "piezas · game ↗", href: "/piezas-game/", external: true },
    ],
    legalLinks: [
      { label: "preguntas frecuentes", href: "/faq" },
      { label: "privacidad", href: "/privacidad" },
      { label: "aviso legal", href: "/aviso-legal" },
      { label: "términos de contratación", href: "/terminos" },
    ],
    copyrightTemplate: "© {year} Enrique Becerra · Madrid",
  },
};

// ---------- Demos ----------

const demoSiteProjection = `{
  "_id": _id,
  "slug": slug.current,
  template,
  "enableEnglish": coalesce(enableEnglish, false),
  "businessName": ${loc("businessName")},
  "tagline": ${loc("tagline")},
  "brand": brand {
    logo,
    primaryColor,
    accentColor,
    inkColor,
    bgTone,
    fontPair
  },
  "hero": hero {
    "kicker": ${loc("kicker")},
    "heading": ${loc("heading")},
    "sub": ${loc("sub")},
    image,
    "ctaPrimary": {
      "label": ${loc("ctaPrimaryLabel")},
      "href": ctaPrimaryHref
    },
    "ctaSecondary": {
      "label": ${loc("ctaSecondaryLabel")},
      "href": ctaSecondaryHref
    }
  },
  "coachStats": coachStats[]{
    "value": ${loc("value")},
    "label": ${loc("label")}
  },
  "about": about {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "body": ${loc("body")},
    "bullets": bullets[]{ "v": coalesce(@[$locale], @.es, @) },
    image
  },
  "servicesSection": servicesSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "services": services[]{
    "title": ${loc("title")},
    "description": ${loc("description")},
    icon,
    image,
    "duration": ${loc("duration")},
    "price": ${loc("price")}
  },
  "objectivesSection": objectivesSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "objectives": objectives[]{
    icon,
    "title": ${loc("title")},
    "description": ${loc("description")}
  },
  "pricing": pricing {
    "enabled": coalesce(enabled, false),
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")},
    "modalities": modalities[]{
      id,
      "label": ${loc("label")}
    },
    "tiers": tiers[]{
      sessions,
      "label": ${loc("label")},
      "prices": prices[]{
        modalityId,
        amount,
        perSession
      }
    },
    "note": ${loc("note")}
  },
  "teamSection": teamSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")}
  },
  "team": team[]{
    name,
    "role": ${loc("role")},
    "bio": ${loc("bio")},
    photo
  },
  "testimonialsSection": testimonialsSection {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")}
  },
  "testimonials": testimonials[]{
    "quote": ${loc("quote")},
    author,
    "context": ${loc("context")},
    photo
  },
  "instagramFeed": instagramFeed {
    "enabled": coalesce(enabled, false),
    handle,
    "ctaLabel": ${loc("ctaLabel")},
    "posts": posts[]{
      image,
      "caption": ${loc("caption")},
      postUrl
    }
  },
  "lifestyleGallery": lifestyleGallery[]{
    image,
    "alt": ${loc("alt")}
  },
  "contact": contact {
    "kicker": ${loc("kicker")},
    "title": ${loc("title")},
    "lead": ${loc("lead")},
    address,
    phone,
    email,
    "hours": hours[]{
      "label": ${loc("label")},
      "value": value
    },
    mapEmbedUrl,
    bookingUrl,
    "social": social[]{ name, url }
  },
  "chatbot": ${chatbotProjection(loc)}
}`;

type RawDemoSite = Omit<DemoSite, "about" | "chatbot"> & {
  about: (Omit<NonNullable<DemoSite["about"]>, "bullets"> & {
    bullets: { v: string }[] | null;
  }) | null;
  chatbot: RawChatbot | null;
};

export async function getDemoSiteBySlug(
  slug: string,
  locale: Locale
): Promise<DemoSite | null> {
  const raw = await runFetch<RawDemoSite | null>(
      `*[_type == "demoSite" && slug.current == $slug][0] ${demoSiteProjection}`,
      { slug, locale }
    )
    .catch(() => null);

  if (!raw) return null;

  return {
    ...raw,
    services: raw.services ?? [],
    team: raw.team ?? [],
    testimonials: raw.testimonials ?? [],
    coachStats: raw.coachStats ?? [],
    objectives: raw.objectives ?? [],
    lifestyleGallery: raw.lifestyleGallery ?? [],
    pricing: raw.pricing
      ? {
          ...raw.pricing,
          modalities: raw.pricing.modalities ?? [],
          tiers: (raw.pricing.tiers ?? []).map((t) => ({
            ...t,
            prices: t.prices ?? [],
          })),
        }
      : null,
    instagramFeed: raw.instagramFeed
      ? {
          ...raw.instagramFeed,
          posts: raw.instagramFeed.posts ?? [],
        }
      : null,
    about: raw.about
      ? {
          ...raw.about,
          bullets: (raw.about.bullets ?? [])
            .map((b) => b.v)
            .filter(Boolean) as string[],
        }
      : null,
    contact: raw.contact
      ? {
          ...raw.contact,
          hours: raw.contact.hours ?? [],
          social: raw.contact.social ?? [],
        }
      : null,
    chatbot: normalizeChatbot(raw.chatbot),
  };
}

export async function getDemoSiteSlugs(): Promise<string[]> {
  return runFetch<string[]>(
      `*[_type == "demoSite" && defined(slug.current)].slug.current`
    )
    .catch(() => []);
}

export async function getPublishedDemoSites(
  locale: Locale
): Promise<DemoSiteSummary[]> {
  return runFetch<DemoSiteSummary[]>(
      `*[_type == "demoSite" && publishedToGallery == true]
        | order(coalesce(galleryOrder, 9999) asc) {
          "_id": _id,
          "slug": slug.current,
          template,
          "businessName": ${loc("businessName")},
          "tagline": ${loc("tagline")},
          "sector": ${loc("sector")},
          "shortDescription": ${loc("shortDescription")},
          thumbnail,
          galleryOrder
        }`,
      { locale }
    )
    .catch(() => []);
}

type RawNavItem =
  | { _type: "navAnchor"; key: string; label: string | null }
  | { _type: "navPage"; href: string; label: string | null };

type RawFooterNavItem =
  | { _type: "footerAnchor"; key: string; label: string | null }
  | { _type: "footerPage"; href: string; label: string | null };

type RawCrossLink = {
  label: string | null;
  href: string;
  external: boolean | null;
};

type RawLegalLink = {
  label: string | null;
  href: string;
};

export async function getSiteSettingsFull(
  locale: Locale
): Promise<SiteSettingsFull> {
  type RawMeta = Omit<SiteSettingsMeta, "keywords"> & {
    keywords: { v: string }[] | null;
  };
  type RawNav = {
    items: RawNavItem[] | null;
    ctaLabel: string | null;
  } | null;
  type RawFooter = {
    tagline: string | null;
    availability: string | null;
    email: string | null;
    colNavTitle: string | null;
    colSocialTitle: string | null;
    colCrossTitle: string | null;
    navColumn: RawFooterNavItem[] | null;
    socialLinks: { name: string; url: string; external: boolean | null }[] | null;
    crossLinks: RawCrossLink[] | null;
    legalLinks: RawLegalLink[] | null;
    copyrightTemplate: string | null;
  } | null;
  type Raw = {
    metadata: RawMeta;
    nav: RawNav;
    footer: RawFooter;
  };

  const raw = await runFetch<Raw | null>(
      `*[_type == "siteSettings"][0] {
        "metadata": metadata {
          "title": ${loc("title")},
          titleTemplate,
          "description": ${loc("description")},
          "ogDescription": ${loc("ogDescription")},
          "twitterDescription": ${loc("twitterDescription")},
          "keywords": keywords[]{ "v": coalesce(@[$locale], @.es, @) }
        },
        "nav": nav {
          "items": items[]{
            _type,
            key,
            href,
            "label": ${loc("label")}
          },
          "ctaLabel": ${loc("ctaLabel")}
        },
        "footer": footer {
          "tagline": ${loc("tagline")},
          "availability": ${loc("availability")},
          email,
          "colNavTitle": ${loc("colNavTitle")},
          "colSocialTitle": ${loc("colSocialTitle")},
          "colCrossTitle": ${loc("colCrossTitle")},
          "navColumn": navColumn[]{
            _type,
            key,
            href,
            "label": ${loc("label")}
          },
          "socialLinks": socialLinks[]{ name, url, external },
          "crossLinks": crossLinks[]{
            "label": ${loc("label")},
            href,
            external
          },
          "legalLinks": legalLinks[]{
            "label": ${loc("label")},
            href
          },
          "copyrightTemplate": ${loc("copyrightTemplate")}
        }
      }`,
      { locale }
    )
    .catch(() => null);

  if (!raw) return DEFAULT_SITE_SETTINGS;

  const mapNavItems = (
    items: RawNavItem[] | RawFooterNavItem[] | null,
    fallback: SiteSettingsNavItem[]
  ): SiteSettingsNavItem[] => {
    if (!items || items.length === 0) return fallback;
    return items
      .map((item): SiteSettingsNavItem | null => {
        if (!item.label) return null;
        if (item._type === "navAnchor" || item._type === "footerAnchor") {
          return { type: "anchor", key: item.key, label: item.label };
        }
        if (item._type === "navPage" || item._type === "footerPage") {
          return { type: "page", href: item.href, label: item.label };
        }
        return null;
      })
      .filter((x): x is SiteSettingsNavItem => x !== null);
  };

  const navItems = mapNavItems(
    raw.nav?.items ?? null,
    DEFAULT_SITE_SETTINGS.nav.items
  );

  const footerNavColumn = mapNavItems(
    raw.footer?.navColumn ?? null,
    DEFAULT_SITE_SETTINGS.footer.navColumn
  );

  const footerCrossLinks: FooterCrossLink[] =
    raw.footer?.crossLinks && raw.footer.crossLinks.length > 0
      ? raw.footer.crossLinks
          .filter((l): l is RawCrossLink & { label: string } => !!l.label)
          .map((l) => ({
            label: l.label,
            href: l.href,
            external: l.external ?? true,
          }))
      : DEFAULT_SITE_SETTINGS.footer.crossLinks;

  const footerLegalLinks: FooterLegalLink[] =
    raw.footer?.legalLinks && raw.footer.legalLinks.length > 0
      ? raw.footer.legalLinks
          .filter((l): l is RawLegalLink & { label: string } => !!l.label)
          .map((l) => ({ label: l.label, href: l.href }))
      : DEFAULT_SITE_SETTINGS.footer.legalLinks;

  return {
    metadata: {
      ...raw.metadata,
      keywords: (raw.metadata.keywords ?? []).map((k) => k.v).filter(Boolean),
    },
    nav: {
      items: navItems,
      ctaLabel: raw.nav?.ctaLabel ?? DEFAULT_SITE_SETTINGS.nav.ctaLabel,
    },
    footer: {
      tagline: raw.footer?.tagline ?? DEFAULT_SITE_SETTINGS.footer.tagline,
      availability:
        raw.footer?.availability ?? DEFAULT_SITE_SETTINGS.footer.availability,
      email: raw.footer?.email ?? DEFAULT_SITE_SETTINGS.footer.email,
      colNavTitle:
        raw.footer?.colNavTitle ?? DEFAULT_SITE_SETTINGS.footer.colNavTitle,
      colSocialTitle:
        raw.footer?.colSocialTitle ??
        DEFAULT_SITE_SETTINGS.footer.colSocialTitle,
      colCrossTitle:
        raw.footer?.colCrossTitle ??
        DEFAULT_SITE_SETTINGS.footer.colCrossTitle,
      navColumn: footerNavColumn,
      socialLinks:
        raw.footer?.socialLinks && raw.footer.socialLinks.length > 0
          ? raw.footer.socialLinks.map((s) => ({
              name: s.name,
              url: s.url,
              external: s.external ?? true,
            }))
          : DEFAULT_SITE_SETTINGS.footer.socialLinks,
      crossLinks: footerCrossLinks,
      legalLinks: footerLegalLinks,
      copyrightTemplate:
        raw.footer?.copyrightTemplate ??
        DEFAULT_SITE_SETTINGS.footer.copyrightTemplate,
    },
  };
}


// =====================================================
// BLOG
// =====================================================

// Calcula minutos de lectura desde el número de caracteres del body en plano.
// Asume ~5 chars/palabra, ~225 palabras/min (estándar reading speed).
function calcReadingMinutes(bodyTextLength: number): number {
  if (bodyTextLength <= 0) return 1;
  return Math.max(1, Math.round(bodyTextLength / 5 / 225));
}

// Proyección compartida para items del listado de posts.
const postListProjection = `
  _id,
  "slug": slug.current,
  "title": ${loc("title")},
  "excerpt": ${loc("excerpt")},
  publishedAt,
  updatedAt,
  coverImage,
  "bodyTextLength": length(pt::text(coalesce(body, []))),
  "category": category->{
    "title": ${loc("title")},
    "slug": slug.current
  },
  "tags": tags[]->{
    "title": ${loc("title")},
    "slug": slug.current
  },
  "author": author->{
    name,
    "slug": slug.current,
    photo
  }
`;

type RawPostListItem = Omit<PostListItem, "readingMinutes" | "tags"> & {
  bodyTextLength: number;
  tags: { title: string; slug: string }[] | null;
};

function normalizePostListItem(raw: RawPostListItem): PostListItem {
  const { bodyTextLength, tags, ...rest } = raw;
  return {
    ...rest,
    tags: tags ?? [],
    readingMinutes: calcReadingMinutes(bodyTextLength),
  };
}

export async function getPosts(
  locale: Locale,
  options: {
    categorySlug?: string;
    tagSlug?: string;
    order?: "newest" | "oldest";
    limit?: number;
    offset?: number;
  } = {}
): Promise<PostListItem[]> {
  const { categorySlug, tagSlug, order = "newest", limit = 50, offset = 0 } =
    options;

  const filters = ['_type == "post"', "noindex != true"];
  if (categorySlug) filters.push("category->slug.current == $categorySlug");
  if (tagSlug) filters.push("$tagSlug in tags[]->slug.current");

  const direction = order === "newest" ? "desc" : "asc";
  const query = `*[${filters.join(" && ")}] | order(publishedAt ${direction}) [${offset}...${offset + limit}] {
    ${postListProjection}
  }`;

  const raw = await runFetch<RawPostListItem[]>(query, { locale, categorySlug, tagSlug })
    .catch(() => [] as RawPostListItem[]);

  return raw.map(normalizePostListItem);
}

export async function getPostSlugs(): Promise<string[]> {
  const raw = await runFetch<{ slug: string | null }[]>(
      `*[_type == "post" && noindex != true]{ "slug": slug.current }`
    )
    .catch(() => [] as { slug: string | null }[]);
  return raw.map((r) => r.slug).filter((s): s is string => Boolean(s));
}

export async function getPostBySlug(
  slug: string,
  locale: Locale
): Promise<PostFull | null> {
  const params = { slug, locale };
  const raw = await runFetch<
      | (RawPostListItem & {
          body: PostFull["body"] | null;
          seoTitle: string | null;
          seoDescription: string | null;
          ogImage: PostFull["ogImage"];
          noindex: boolean | null;
          authorFull: BlogAuthor | null;
          relatedPostsManual: RawPostListItem[] | null;
        })
      | null
    >(
      `*[_type == "post" && slug.current == $slug][0] {
        ${postListProjection},
        "body": coalesce(${locale === "en" ? "bodyEn" : "body"}, body),
        "seoTitle": ${loc("seoTitle")},
        "seoDescription": ${loc("seoDescription")},
        ogImage,
        noindex,
        "authorFull": author->{
          _id,
          name,
          "slug": slug.current,
          "jobTitle": ${loc("jobTitle")},
          "bioShort": ${loc("bioShort")},
          "bioLong": ${loc("bioLong")},
          email,
          photo,
          "social": social{
            linkedinUrl,
            githubUrl,
            twitterUrl,
            instagramUrl,
            websiteUrl
          }
        },
        "relatedPostsManual": relatedPosts[]->{ ${postListProjection} }
      }`,
      params
    )
    .catch(() => null);

  if (!raw) return null;

  const base = normalizePostListItem(raw);
  return {
    ...base,
    body: raw.body ?? [],
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    ogImage: raw.ogImage,
    noindex: raw.noindex ?? false,
    authorFull: raw.authorFull
      ? {
          ...raw.authorFull,
          social: raw.authorFull.social ?? {
            linkedinUrl: null,
            githubUrl: null,
            twitterUrl: null,
            instagramUrl: null,
            websiteUrl: null,
          },
        }
      : null,
    relatedPostsManual: (raw.relatedPostsManual ?? []).map(normalizePostListItem),
  };
}

export async function getRelatedPostsAuto(
  postId: string,
  categorySlug: string | null,
  tagSlugs: string[],
  locale: Locale,
  limit = 3
): Promise<PostListItem[]> {
  // Heurística: posts en la misma categoría o que comparten al menos un tag,
  // excluyendo el actual. Ordenados por publishedAt desc.
  const raw = await runFetch<RawPostListItem[]>(
      `*[
        _type == "post"
        && _id != $postId
        && noindex != true
        && (
          category->slug.current == $categorySlug
          || count((tags[]->slug.current)[@ in $tagSlugs]) > 0
        )
      ] | order(publishedAt desc) [0...$limit] {
        ${postListProjection}
      }`,
      { postId, categorySlug, tagSlugs, locale, limit }
    )
    .catch(() => [] as RawPostListItem[]);

  return raw.map(normalizePostListItem);
}

export async function getCategories(locale: Locale): Promise<BlogCategory[]> {
  return runFetch<BlogCategory[]>(
      `*[_type == "blogCategory"] | order(order asc) {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")},
        "order": coalesce(order, 100)
      }`,
      { locale }
    )
    .catch(() => [] as BlogCategory[]);
}

export async function getCategoryBySlug(
  slug: string,
  locale: Locale
): Promise<BlogCategory | null> {
  return runFetch<BlogCategory | null>(
      `*[_type == "blogCategory" && slug.current == $slug][0] {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")},
        "order": coalesce(order, 100)
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getTags(locale: Locale): Promise<BlogTag[]> {
  return runFetch<BlogTag[]>(
      `*[_type == "blogTag"] | order(title.es asc) {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")}
      }`,
      { locale }
    )
    .catch(() => [] as BlogTag[]);
}

export async function getTagBySlug(
  slug: string,
  locale: Locale
): Promise<BlogTag | null> {
  return runFetch<BlogTag | null>(
      `*[_type == "blogTag" && slug.current == $slug][0] {
        _id,
        "title": ${loc("title")},
        "slug": slug.current,
        "description": ${loc("description")}
      }`,
      { slug, locale }
    )
    .catch(() => null);
}

export async function getAuthorBySlug(
  slug: string,
  locale: Locale
): Promise<BlogAuthor | null> {
  return runFetch<BlogAuthor | null>(
      `*[_type == "author" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        "jobTitle": ${loc("jobTitle")},
        "bioShort": ${loc("bioShort")},
        "bioLong": ${loc("bioLong")},
        email,
        photo,
        "social": coalesce(social, {})
      }`,
      { slug, locale }
    )
    .catch(() => null);
}
