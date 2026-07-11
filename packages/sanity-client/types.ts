export type Locale = string;

export type Feature = { icon: string; label: string; desc: string };

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  tag: string | null;
  desc: string;
  tech: string[];
};

export type Skill = { name: string; level: number };

export type ProjectLink = { text: string; href: string; external: boolean };

export type Project = {
  id: string;
  label: string;
  title: string;
  description: string;
  tech: string[];
  status: string;
  statusText: string;
  links: ProjectLink[];
};

// ---------- Services Pricing (singleton) ----------

export type ServicesPricingTierFeature = {
  text: string;
  highlight: boolean;
};

export type ServicesPricingTier = {
  id: string;
  name: string;
  subtitle: string | null;
  priceMain: string;
  priceSecondary: string | null;
  conditions: string | null;
  features: ServicesPricingTierFeature[];
  highlighted: boolean;
  badge: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type ServicesPricingPath = {
  id: string;
  label: string;
  tagline: string | null;
  isDefault: boolean;
  tiers: ServicesPricingTier[];
};

export type ServicesPricingCancellationClause = {
  showOnPathId: string | null;
  label: string | null;
  body: string | null;
};

export type ServicesPricingGuaranteeBadge = {
  enabled: boolean;
  text: string | null;
};

export type ServicesPricingAddOn = {
  title: string;
  price: string | null;
  note: string | null;
};

export type ServicesPricing = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
  pathSelectorLabel: string | null;
  guaranteeBadge: ServicesPricingGuaranteeBadge | null;
  paths: ServicesPricingPath[];
  cancellationClause: ServicesPricingCancellationClause | null;
  addOnsSectionTitle: string | null;
  addOnsSectionLead: string | null;
  addOns: ServicesPricingAddOn[];
  migrationFootnote: string | null;
};

// ---------- Google Reviews (singleton) ----------

export type GoogleReviewItem = {
  author: string;
  rating: number;
  relativeDate: string | null;
  text: string;
};

export type GoogleReviewsData = {
  enabled: boolean;
  kicker: string | null;
  title: string | null;
  lead: string | null;
  ratingAverage: number | null;
  ratingCount: number | null;
  placeUrl: string | null;
  reviews: GoogleReviewItem[];
};

export type ProcessStep = {
  _id: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
};

export type CaseStudyMetric = { label: string; value: string };

export type SanityImage = {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
  caption?: string;
};

export type PortableTextBlock = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

export type CaseStudySummary = {
  _id: string;
  title: string;
  slug: string;
  client: string | null;
  clientAnonymized: boolean;
  year: number | null;
  summary: string;
  cover: SanityImage | null;
  featured: boolean;
};

export type HeroSection = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
  ctaPrimary: string | null;
  ctaSecondary: string | null;
  trustBadges: string[];
  marqueeItems: string[];
  offerBadge: string | null;
};

// ---------- Capabilities (sección 03) ----------

export type CapabilityCard = {
  icon: string;
  badge: string | null;
  featured: boolean;
  title: string;
  description: string;
  bullets: string[];
};

export type CapabilitiesSection = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
  items: CapabilityCard[];
  noteLabel: string | null;
  noteText: string | null;
};

export type SiteSettingsMeta = {
  title: string | null;
  titleTemplate: string | null;
  description: string | null;
  ogDescription: string | null;
  twitterDescription: string | null;
  keywords: string[];
};

export type ProfileContact = {
  email: string | null;
  linkedinUrl: string | null;
  whatsapp: string | null;
  location: string | null;
  responseTime: string | null;
};

export type CaseStudy = CaseStudySummary & {
  problem: string | null;
  solution: string | null;
  outcome: string | null;
  metrics: CaseStudyMetric[];
  stack: { name: string }[];
  images: SanityImage[];
  body: PortableTextBlock[];
};

export type SectionMeta = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
};

export type ServiceSectionMeta = SectionMeta & {
  auditStrip: { kicker: string | null; body: string | null } | null;
};

export type CasesSectionLabels = {
  context: string | null;
  solution: string | null;
  result: string | null;
  translates: string | null;
};

export type CasesSectionMeta = SectionMeta & {
  labels: CasesSectionLabels | null;
};

export type ContactSectionLabels = {
  email: string | null;
  linkedin: string | null;
  location: string | null;
  response: string | null;
};

export type ContactSectionMeta = SectionMeta & {
  labels: ContactSectionLabels | null;
};

// ---------- Contact form (wizard editable) ----------

export type ContactFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "url"
  | "date"
  | "number"
  | "select"
  | "multiselect"
  | "cards";

export type ContactOption = {
  value: string;
  code: string;
  sub: string | null;
};

export type ContactField = {
  key: string;
  type: ContactFieldType;
  label: string;
  helper: string | null;
  placeholder: string | null;
  required: boolean;
  columns: 1 | 2 | 3;
  autoComplete: string | null;
  inputMode: string | null;
  options: ContactOption[];
};

export type ContactFormStepKind = "fields";

export type ContactFormStep = {
  _id: string;
  stepIndex: number;
  title: string | null;
  description: string | null;
  kind: ContactFormStepKind;
  note: string | null;
  footnote: string | null;
  fields: ContactField[];
};

export type ContactForm = {
  steps: ContactFormStep[];
  submitLabel: string;
  sendingLabel: string;
  gdprLabel: string;
  honeypotLabel: string;
  successMessage: string;
  errorMessage: string;
  missingRequiredMessage: string;
};

// Proyección barata para el backend (solo lo que /api/contact necesita
// para validar required y mapear options.code).
export type ContactFormFieldBackend = {
  key: string;
  type: ContactFieldType;
  required: boolean;
  options: { code: string }[];
};

export type ContactFormBackend = {
  fields: ContactFormFieldBackend[];
};

// =====================================================
// TECH (ebecerra.tech)
// =====================================================

export type TechTerminalLines = {
  whoamiOut: string | null;
  roleOut: string | null;
  skillsOut: string | null;
  statusOut: string | null;
};

export type TechTerminalCommands = {
  help: string | null;
  whoami: string | null;
  role: string | null;
  skills: string | null;
  status: string | null;
  pwd: string | null;
  ls: string | null;
  exit: string | null;
  gitBlame: string | null;
};

export type TechTerminal = {
  title: string | null;
  placeholder: string | null;
  cdBlocked: string | null;
  sudoBlocked: string | null;
  rmBlocked: string | null;
  notFound: string | null;
  lines: TechTerminalLines;
  commands: TechTerminalCommands;
};

export type TechHero = {
  available: string | null;
  firstName: string | null;
  lastName: string | null;
  tagline: string | null;
  ctaContact: string | null;
  ctaProjects: string | null;
  terminal: TechTerminal;
};

export type TechSectionChrome = {
  eyebrow: string | null;
  title: string | null;
};

export type TechAboutSection = TechSectionChrome & {
  bio1: string | null;
  bio2: string | null;
  bio3: string | null;
};

export type TechContactChrome = TechSectionChrome & {
  description: string | null;
};

export type TechHomeSections = {
  hero: TechHero;
  about: TechAboutSection;
  experience: TechSectionChrome;
  skills: TechSectionChrome;
  projects: TechSectionChrome;
  contact: TechContactChrome;
};

export type TechSiteSettingsMeta = {
  title: string | null;
  titleTemplate: string | null;
  description: string | null;
  ogDescription: string | null;
  twitterDescription: string | null;
  keywords: string[];
};

export type TechNavItem = {
  key: string;
  label: string;
};

export type TechFooterSettings = {
  copyrightTemplate: string | null;
  online: string | null;
  version: string | null;
};

export type TechSiteSettings = {
  metadata: TechSiteSettingsMeta;
  nav: { items: TechNavItem[] };
  footer: TechFooterSettings;
};

export type TechContactForm = ContactForm;
export type TechContactFormBackend = ContactFormBackend;

// =====================================================
// DEMOS (demos.ebecerra.es)
// =====================================================

export type DemosIndexPage = {
  title: string;
  lead: string;
  ctaBack: string;
};

export type DemosBannerSettings = {
  label: string;
  text: string;
  ctaLabel: string;
  ctaHref: string;
};

// =====================================================
// BLOG PAGE (chrome del blog)
// =====================================================

export type BlogCommentForm = {
  title: string;
  name: string;
  email: string;
  emailHint: string;
  body: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  privacy: string;
};

export type BlogPageData = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  empty: string;
  filterAll: string;
  filterCategory: string;
  sortNewest: string;
  sortOldest: string;
  backToList: string;
  byPrefix: string;
  byAuthor: string;
  publishedOn: string;
  updatedOn: string;
  tocLabel: string;
  shareLabel: string;
  relatedHeading: string;
  likeLabel: string;
  likeThanks: string;
  commentsHeading: string;
  commentsEmpty: string;
  commentForm: BlogCommentForm;
};

// =====================================================
// EXAMPLES PAGE
// =====================================================

export type ExamplesPageData = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  ctaContact: string;
  homeKicker: string;
  homeTitle: string;
  homeLead: string;
  homeViewAll: string;
  emptyState: string;
  viewDemoLabel: string;
  openInNewTabLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export type FaqPageData = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  contactSectionTitle: string;
  contactSectionLead: string;
  contactCta: string;
};

export type AboutPagePillar = { title: string; body: string };

export type LandingMadridItem = { title: string; body: string };
export type LandingMadridQa = { question: string; answer: string };

export type LandingMadridData = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  intro: { text: string }[];
  servicesTitle: string;
  services: LandingMadridItem[];
  reachTitle: string;
  reachBody: { text: string }[];
  diffTitle: string;
  diffItems: LandingMadridItem[];
  examplesTitle: string;
  examplesBody: string;
  examplesCtaLabel: string;
  faqTitle: string;
  faqItems: LandingMadridQa[];
  closingTitle: string;
  closingBody: string;
  closingCtaLabel: string;
};

// Landing por sector (colección reutilizable). Misma forma que la de Madrid
// pero con slug propio y sin closingCtaLabel (el cierre alimenta el título/lead
// del formulario de contacto embebido).
export type SectorLandingData = {
  slug: string;
  internalName: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  intro: { text: string }[];
  servicesTitle: string;
  services: LandingMadridItem[];
  reachTitle: string;
  reachBody: { text: string }[];
  diffTitle: string;
  diffItems: LandingMadridItem[];
  examplesTitle: string;
  examplesBody: string;
  examplesCtaLabel: string;
  featuredDemo: SectorFeaturedDemo | null;
  faqTitle: string;
  faqItems: LandingMadridQa[];
  closingTitle: string;
  closingBody: string;
};

export type SectorFeaturedDemo = {
  demoSlug: string;
  eyebrow: string;
  ctaLabel: string;
};

export type AboutPageData = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: string;
  lead: string;
  intro: { text: string }[];
  pillarsTitle: string;
  pillars: AboutPagePillar[];
  closingTitle: string;
  closingBody: string;
  closingCtaLabel: string;
};

export type FaqItem = {
  _id: string;
  question: string;
  answer: string;
  order: number;
  category: string | null;
};

export type LegalPageData = {
  slug: string;
  title: string;
  metaDescription: string | null;
  content: PortableTextBlock[];
  updatedAt: string | null;
};

export type FooterNavItem =
  | { type: "anchor"; key: string; label: string }
  | { type: "page"; href: string; label: string };

export type FooterCrossLink = {
  label: string;
  href: string;
  external: boolean;
};

export type FooterLegalLink = {
  label: string;
  href: string;
};

export type SiteSettingsFooter = {
  tagline: string | null;
  availability: string | null;
  email: string | null;
  colNavTitle: string | null;
  colSocialTitle: string | null;
  colCrossTitle: string | null;
  navColumn: FooterNavItem[];
  socialLinks: { name: string; url: string; external: boolean }[];
  crossLinks: FooterCrossLink[];
  legalLinks: FooterLegalLink[];
  copyrightTemplate: string | null;
};

export type SiteSettingsNavItem =
  | { type: "anchor"; key: string; label: string }
  | { type: "page"; href: string; label: string };

export type SiteSettingsNav = {
  items: SiteSettingsNavItem[];
  ctaLabel: string | null;
};

export type ProfileStat = { value: string; label: string };

export type ProfileFull = {
  name: string | null;
  jobTitle: string | null;
  aboutKicker: string | null;
  aboutTitle: string | null;
  aboutPhoto: SanityImage | null;
  aboutViewProfileCta: string | null;
  bio1: string | null;
  bio2: string | null;
  stats: ProfileStat[];
  aboutFeatures: Feature[] | null;
  contact: ProfileContact | null;
  chatbot: ChatbotConfig | null;
};

// ---------- Integraciones (franja de herramientas, home apps/es) ----------

export type IntegrationItem = {
  name: string;
  logo: SanityImage | null;
  url: string | null;
};

export type IntegrationsStrip = {
  enabled: boolean;
  heading: string | null;
  items: IntegrationItem[];
};

// ---------- Chatbot ----------

export type ChatbotConfig = {
  enabled: boolean;
  label: string | null;
  title: string | null;
  greeting: string | null;
  placeholder: string | null;
  systemPrompt: string | null;
  disclaimers: string[];
};

export type SiteSettingsFull = {
  metadata: SiteSettingsMeta;
  nav: SiteSettingsNav;
  footer: SiteSettingsFooter;
};

// ---------- Demo sites ----------

export type DemoTemplate =
  | "fisio"
  | "dental"
  | "legal"
  | "coach-editorial"
  | "coach-vibrant"
  | "tandem"
  | "expedicion"
  | "gestoria"
  | "beemovement"
  | "tienda";

export type DemoCta = {
  label: string | null;
  href: string | null;
};

export type DemoHero = {
  kicker: string | null;
  heading: string | null;
  sub: string | null;
  image: SanityImage | null;
  ctaPrimary: DemoCta;
  ctaSecondary: DemoCta;
};

export type DemoAbout = {
  kicker: string | null;
  title: string | null;
  body: string | null;
  bullets: string[];
  image: SanityImage | null;
};

export type DemoSectionHeader = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
};

export type DemoService = {
  title: string;
  description: string | null;
  icon: string | null;
  image: SanityImage | null;
  duration: string | null;
  price: string | null;
};

export type DemoLifestyleImage = {
  image: SanityImage;
  alt: string | null;
};

export type DemoTeamMember = {
  name: string;
  role: string | null;
  bio: string | null;
  photo: SanityImage | null;
  hoverPhoto: SanityImage | null;
};

export type DemoTestimonial = {
  quote: string;
  author: string;
  context: string | null;
  photo: SanityImage | null;
};

export type DemoHourEntry = {
  label: string | null;
  value: string | null;
};

export type DemoSocial = {
  name: string | null;
  url: string | null;
};

export type DemoContact = {
  kicker: string | null;
  title: string | null;
  lead: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  hours: DemoHourEntry[];
  mapEmbedUrl: string | null;
  bookingUrl: string | null;
  social: DemoSocial[];
};

export type DemoBrandOverrides = {
  logo: SanityImage | null;
  primaryColor: string | null;
  accentColor: string | null;
  inkColor: string | null;
  bgTone: "cream" | "off-white" | "sand" | "cool-white" | null;
  fontPair: "default" | "coach-a" | "coach-b" | null;
};

export type DemoCoachStat = {
  value: string;
  label: string;
};

export type DemoObjective = {
  icon: string | null;
  title: string;
  description: string | null;
};

export type DemoPricingModality = {
  id: string;
  label: string;
};

export type DemoPricingPrice = {
  modalityId: string;
  amount: number;
  perSession: number | null;
};

export type DemoPricingTier = {
  sessions: number;
  label: string;
  prices: DemoPricingPrice[];
};

export type DemoPricing = {
  enabled: boolean;
  kicker: string | null;
  title: string | null;
  lead: string | null;
  modalities: DemoPricingModality[];
  tiers: DemoPricingTier[];
  note: string | null;
};

export type DemoInstagramPost = {
  image: SanityImage;
  caption: string | null;
  postUrl: string | null;
};

export type DemoInstagramFeed = {
  enabled: boolean;
  handle: string | null;
  ctaLabel: string | null;
  posts: DemoInstagramPost[];
};

export type DemoSite = {
  _id: string;
  slug: string;
  template: DemoTemplate;
  enableEnglish: boolean;
  businessName: string;
  tagline: string | null;
  brand: DemoBrandOverrides | null;
  hero: DemoHero | null;
  coachStats: DemoCoachStat[];
  about: DemoAbout | null;
  servicesSection: DemoSectionHeader | null;
  services: DemoService[];
  objectivesSection: DemoSectionHeader | null;
  objectives: DemoObjective[];
  pricing: DemoPricing | null;
  teamSection: DemoSectionHeader | null;
  team: DemoTeamMember[];
  testimonialsSection: DemoSectionHeader | null;
  testimonials: DemoTestimonial[];
  instagramFeed: DemoInstagramFeed | null;
  lifestyleGallery: DemoLifestyleImage[];
  contact: DemoContact | null;
  chatbot: ChatbotConfig | null;
};

export type DemoSiteSummary = {
  _id: string;
  slug: string;
  template: DemoTemplate;
  businessName: string;
  tagline: string | null;
  sector: string | null;
  shortDescription: string | null;
  thumbnail: SanityImage | null;
  galleryOrder: number | null;
};

// =====================================================
// BLOG
// =====================================================

export type BlogAuthorSocial = {
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
};

export type BlogAuthor = {
  _id: string;
  name: string;
  slug: string;
  jobTitle: string | null;
  bioShort: string;
  bioLong: string | null;
  email: string | null;
  photo: SanityImage | null;
  social: BlogAuthorSocial;
};

export type BlogCategory = {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  /** Nº de posts indexables que referencian la categoría. Lo puebla getCategories; usado por el sitemap para no anunciar categorías vacías. */
  postCount?: number;
};

export type BlogTag = {
  _id: string;
  title: string;
  slug: string;
  description: string | null;
};

export type PostListItem = {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string | null;
  coverImage: SanityImage | null;
  readingMinutes: number;
  category: { title: string; slug: string } | null;
  tags: { title: string; slug: string }[];
  author: { name: string; slug: string; photo: SanityImage | null } | null;
};

export type PostFull = PostListItem & {
  body: PortableTextBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: SanityImage | null;
  noindex: boolean;
  authorFull: BlogAuthor | null;
  relatedPostsManual: PostListItem[];
};

