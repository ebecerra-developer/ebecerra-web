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

export type Service = {
  _id: string;
  title: string;
  slug: string;
  icon: string | null;
  summary: string;
  description: string | null;
  deliverables: string[];
  priceRange: string | null;
  priceNote: string | null;
  featured: boolean;
};

// ---------- Services Pricing (singleton) ----------

export type ServicesPricingTierFeature = {
  text: string;
  highlight: boolean;
};

export type ServicesPricingTier = {
  id: string;
  name: string;
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
  paths: ServicesPricingPath[];
  cancellationClause: ServicesPricingCancellationClause | null;
  addOnsSectionTitle: string | null;
  addOnsSectionLead: string | null;
  addOns: ServicesPricingAddOn[];
  migrationFootnote: string | null;
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

export type FaqPageData = {
  metaTitle: string | null;
  metaDescription: string | null;
  kicker: string | null;
  title: string | null;
  lead: string | null;
  contactSectionTitle: string | null;
  contactSectionLead: string | null;
  contactCta: string | null;
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

export type SiteSettingsFooter = {
  tagline: string | null;
  availability: string | null;
  email: string | null;
  socialLinks: { name: string; url: string; external: boolean }[];
};

export type ProfileStat = { value: string; label: string };

export type ProfileFull = {
  name: string | null;
  jobTitle: string | null;
  bio1: string | null;
  bio2: string | null;
  stats: ProfileStat[];
  aboutFeatures: Feature[] | null;
  contact: ProfileContact | null;
  chatbot: ChatbotConfig | null;
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
  footer: SiteSettingsFooter;
};

// ---------- Demo sites ----------

export type DemoTemplate =
  | "fisio"
  | "dental"
  | "legal"
  | "coach-editorial"
  | "coach-vibrant"
  | "tandem";

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

