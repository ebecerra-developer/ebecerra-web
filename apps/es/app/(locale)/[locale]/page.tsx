import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFallback } from "@/lib/content";
import {
  getProcessSteps,
  getProfileFeatures,
  getHeroSection,
  getProfileContact,
  getProfile,
  getServicesPricing,
  getSectionMeta,
  getSiteSettingsFooter,
} from "@ebecerra/sanity-client";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
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
    servicesPricing,
    processSteps,
    profileFeatures,
    contactData,
    profileData,
    processMeta,
    contactMeta,
    footerData,
  ] = await Promise.all([
    getHeroSection(locale).catch(() => null),
    getServicesPricing(locale).catch(() => null),
    getProcessSteps(locale).catch(() => []),
    getProfileFeatures(locale).catch(() => null),
    getProfileContact(locale).catch(() => null),
    getProfile(locale).catch(() => null),
    getSectionMeta("processSectionMeta", locale).catch(() => null),
    getSectionMeta("contactSectionMeta", locale).catch(() => null),
    getSiteSettingsFooter(locale).catch(() => null),
  ]);

  const resolvedProcess = processSteps.length > 0 ? processSteps : fallback.processSteps;
  const resolvedFeatures = profileFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        <Hero sanityData={heroData} />
        <Services pricing={servicesPricing} />
        <About features={resolvedFeatures} profile={profileData} />
        <Capabilities />
        <Process steps={resolvedProcess} sectionMeta={processMeta} />
        <Examples locale={locale} />
        <Contact contactData={contactData} sectionMeta={contactMeta} />
      </main>
      <Footer footerData={footerData} />
    </>
  );
}
