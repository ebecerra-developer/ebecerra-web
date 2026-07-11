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
  getGoogleReviews,
} from "@ebecerra/sanity-client";
import StackScroll from "@/components/StackScroll";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Capabilities from "@/components/sections/Capabilities";
import Process from "@/components/sections/Process";
import Examples from "@/components/sections/Examples";
import GoogleReviews from "@/components/sections/GoogleReviews";
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
    googleReviews,
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
    getGoogleReviews(locale).catch(() => null),
  ]);

  const resolvedProcess = processSteps.length > 0 ? processSteps : fallback.processSteps;
  const resolvedFeatures = profileFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        {/* Secciones apiladas: cada una queda fija y se aleja mientras la
            siguiente sube y la tapa (StackScroll). Las más altas que la pantalla
            se scrollean normal hasta su fondo antes de fijarse. El hero entra
            como primera sección del apilado (a pantalla completa, con su banda
            anclada abajo), así Servicios también sube a taparlo. */}
        <StackScroll>
          <Hero sanityData={heroData} />
          {/* La banda va pegada ARRIBA de Servicios: sube con esta sección
              cuando se desliza sobre el hero (mismo item del stack). */}
          <div className="bandedSection">
            <Marquee items={heroData?.marqueeItems ?? []} />
            <Services pricing={servicesPricing} />
          </div>
          <About features={resolvedFeatures} profile={profileData} />
          <Capabilities
            section={capabilitiesSection}
            integrations={integrationsStrip}
          />
          <Process steps={resolvedProcess} sectionMeta={processMeta} />
          {/* Ejemplos vuelve al apilado: se eleva tapando a Proceso (que se aleja)
              como las demás. Su carrusel fijado (pin + cover-flow) convive porque
              el recede solo le aplica opacidad, nunca transform (ver StackScroll
              + data-stage). */}
          <Examples locale={locale} />
          {googleReviews ? <GoogleReviews data={googleReviews} /> : null}
          <Contact contactMeta={contactMeta} profile={profileData} />
        </StackScroll>
      </main>
      <Footer />
    </>
  );
}
