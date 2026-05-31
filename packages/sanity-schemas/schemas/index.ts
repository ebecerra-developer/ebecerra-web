import experience from "./experience";
import skill from "./skill";
import techTag from "./techTag";
import project from "./project";
import profile from "./profile";
import servicesPricing from "./servicesPricing";
import processStep from "./processStep";
import caseStudy from "./caseStudy";
import heroSection from "./heroSection";
import capabilitiesSection from "./capabilitiesSection";
import integrationsStrip from "./integrationsStrip";
import contactFormStep from "./contactFormStep";
import contactFormSettings from "./contactFormSettings";
import techHomeSections from "./techHomeSections";
import techSiteSettings from "./techSiteSettings";
import techContactFormStep from "./techContactFormStep";
import techContactFormSettings from "./techContactFormSettings";
import demosIndexPage from "./demosIndexPage";
import demosBannerSettings from "./demosBannerSettings";
import blogPage from "./blogPage";
import siteSettings from "./siteSettings";
import {
  serviceSectionMeta,
  processSectionMeta,
  casesSectionMeta,
  contactSectionMeta,
} from "./sectionMeta";
import faqPage from "./faqPage";
import aboutPage from "./aboutPage";
import faqItem from "./faqItem";
import legalPage from "./legalPage";
import demoSite from "./demoSite";
import examplesPage from "./examplesPage";
import chatbot from "./chatbot";
import author from "./author";
import blogCategory from "./blogCategory";
import blogTag from "./blogTag";
import post from "./post";
import { localeString, localeText, localePortableText } from "./locale";

export const schemaTypes = [
  // Locale helpers
  localeString,
  localeText,
  localePortableText,
  // Object types compartidos
  chatbot,
  // Singletons — home + settings
  heroSection,
  capabilitiesSection,
  integrationsStrip,
  siteSettings,
  serviceSectionMeta,
  servicesPricing,
  processSectionMeta,
  casesSectionMeta,
  contactSectionMeta,
  contactFormSettings,
  contactFormStep,
  // Tech-specific singletons (ebecerra.tech)
  techHomeSections,
  techSiteSettings,
  techContactFormSettings,
  techContactFormStep,
  // Demos-specific singletons (demos.ebecerra.es)
  demosIndexPage,
  demosBannerSettings,
  blogPage,
  faqPage,
  examplesPage,
  aboutPage,
  profile,
  // Colecciones
  experience,
  skill,
  techTag,
  project,
  processStep,
  caseStudy,
  faqItem,
  legalPage,
  demoSite,
  // Blog
  author,
  blogCategory,
  blogTag,
  post,
];

export const SINGLETON_TYPES = [
  "heroSection",
  "capabilitiesSection",
  "integrationsStrip",
  "siteSettings",
  "serviceSectionMeta",
  "servicesPricing",
  "processSectionMeta",
  "casesSectionMeta",
  "contactSectionMeta",
  "contactFormSettings",
  "techHomeSections",
  "techSiteSettings",
  "techContactFormSettings",
  "demosIndexPage",
  "demosBannerSettings",
  "blogPage",
  "faqPage",
  "examplesPage",
  "aboutPage",
  "profile",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];
