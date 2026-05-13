import experience from "./experience";
import skill from "./skill";
import techTag from "./techTag";
import project from "./project";
import profile from "./profile";
import service from "./service";
import processStep from "./processStep";
import caseStudy from "./caseStudy";
import heroSection from "./heroSection";
import siteSettings from "./siteSettings";
import {
  serviceSectionMeta,
  processSectionMeta,
  casesSectionMeta,
  contactSectionMeta,
} from "./sectionMeta";
import faqPage from "./faqPage";
import faqItem from "./faqItem";
import legalPage from "./legalPage";
import demoSite from "./demoSite";
import chatbot from "./chatbot";
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
  siteSettings,
  serviceSectionMeta,
  processSectionMeta,
  casesSectionMeta,
  contactSectionMeta,
  faqPage,
  profile,
  // Colecciones
  experience,
  skill,
  techTag,
  project,
  service,
  processStep,
  caseStudy,
  faqItem,
  legalPage,
  demoSite,
];

export const SINGLETON_TYPES = [
  "heroSection",
  "siteSettings",
  "serviceSectionMeta",
  "processSectionMeta",
  "casesSectionMeta",
  "contactSectionMeta",
  "faqPage",
  "profile",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];
