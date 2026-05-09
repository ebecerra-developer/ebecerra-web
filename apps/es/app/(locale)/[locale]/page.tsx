import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFallback } from "@/lib/content";
import {
  getFeaturedServices,
  getProcessSteps,
  getProfileFeatures,
  getHeroSection,
  getProfileContact,
  getProfile,
  getServiceSectionMeta,
  getSectionMeta,
  getSiteSettingsFooter,
} from "@ebecerra/sanity-client";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Process from "@/components/sections/Process";
import Examples from "@/components/sections/Examples";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const fallback = getFallback(locale);

  const [
    heroData,
    services,
    processSteps,
    profileFeatures,
    contactData,
    profileData,
    servicesMeta,
    processMeta,
    contactMeta,
    footerData,
  ] = await Promise.all([
    getHeroSection(locale).catch(() => null),
    getFeaturedServices(locale).catch(() => []),
    getProcessSteps(locale).catch(() => []),
    getProfileFeatures(locale).catch(() => null),
    getProfileContact(locale).catch(() => null),
    getProfile(locale).catch(() => null),
    getServiceSectionMeta(locale).catch(() => null),
    getSectionMeta("processSectionMeta", locale).catch(() => null),
    getSectionMeta("contactSectionMeta", locale).catch(() => null),
    getSiteSettingsFooter(locale).catch(() => null),
  ]);

  const resolvedServices = services.length > 0 ? services : fallback.services;
  const resolvedProcess = processSteps.length > 0 ? processSteps : fallback.processSteps;
  const resolvedFeatures = profileFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        <Hero sanityData={heroData} />
        <Services services={resolvedServices} sectionMeta={servicesMeta} />
        <About features={resolvedFeatures} profile={profileData} />
        <Process steps={resolvedProcess} sectionMeta={processMeta} />
        <Examples locale={locale} />
        <Contact contactData={contactData} sectionMeta={contactMeta} />
      </main>
      <Footer footerData={footerData} />
    </>
  );
}
