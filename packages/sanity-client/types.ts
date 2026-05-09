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
};

export type SiteSettingsFull = {
  metadata: SiteSettingsMeta;
  footer: SiteSettingsFooter;
};

// ---------- Demo sites ----------

export type DemoTemplate = "fisio" | "dental" | "legal" | "coach";

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
  duration: string | null;
  price: string | null;
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

export type DemoSite = {
  _id: string;
  slug: string;
  template: DemoTemplate;
  enableEnglish: boolean;
  businessName: string;
  tagline: string | null;
  hero: DemoHero | null;
  about: DemoAbout | null;
  servicesSection: DemoSectionHeader | null;
  services: DemoService[];
  teamSection: DemoSectionHeader | null;
  team: DemoTeamMember[];
  testimonialsSection: DemoSectionHeader | null;
  testimonials: DemoTestimonial[];
  contact: DemoContact | null;
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

