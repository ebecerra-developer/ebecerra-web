import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFallback } from "@/lib/content";
import {
  getProcessSteps,
  getProfileFeatures,
  getHeroSection,
  getProfile,
  getServicesPricing,
  getCapabilitiesSection,
  getIntegrationsStrip,
  getContactSectionMeta,
  getSectionMeta,
} from "@ebecerra/sanity-client";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Integrations from "@/components/sections/Integrations";
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
    profileData,
    capabilitiesSection,
    integrationsStrip,
    processMeta,
    contactMeta,
  ] = await Promise.all([
    getHeroSection(locale).catch(() => null),
    getServicesPricing(locale).catch(() => null),
    getProcessSteps(locale).catch(() => []),
    getProfileFeatures(locale).catch(() => null),
    getProfile(locale).catch(() => null),
    getCapabilitiesSection(locale),
    getIntegrationsStrip(locale).catch(() => ({
      enabled: false,
      heading: null,
      items: [],
    })),
    getSectionMeta("processSectionMeta", locale).catch(() => null),
    getContactSectionMeta(locale),
  ]);

  const resolvedProcess = processSteps.length > 0 ? processSteps : fallback.processSteps;
  const resolvedFeatures = profileFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        <Hero sanityData={heroData} />
        <Marquee items={heroData?.marqueeItems ?? []} />
        <Services pricing={servicesPricing} />
        <About features={resolvedFeatures} profile={profileData} />
        <Capabilities section={capabilitiesSection} />
        <Integrations data={integrationsStrip} />
        <Process steps={resolvedProcess} sectionMeta={processMeta} />
        <Examples locale={locale} />
        <Contact contactMeta={contactMeta} profile={profileData} />
      </main>
      <Footer />
    </>
  );
}
