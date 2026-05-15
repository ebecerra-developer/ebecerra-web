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
  siteSettings,
  serviceSectionMeta,
  processSectionMeta,
  casesSectionMeta,
  contactSectionMeta,
  faqPage,
  examplesPage,
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
  // Blog
  author,
  blogCategory,
  blogTag,
  post,
];

export const SINGLETON_TYPES = [
  "heroSection",
  "siteSettings",
  "serviceSectionMeta",
  "processSectionMeta",
  "casesSectionMeta",
  "contactSectionMeta",
  "faqPage",
  "examplesPage",
  "profile",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];
