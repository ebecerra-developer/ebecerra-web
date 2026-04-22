import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getFallback } from "@/lib/content";
import {
  getFeaturedServices,
  getProcessSteps,
  getFeaturedCaseForHome,
  getProfileFeatures,
} from "@ebecerra/sanity-client";
import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Case from "@/components/sections/Case";
import About from "@/components/sections/About";
import Process from "@/components/sections/Process";
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

  // Sanity en paralelo con fallback seguro: cualquier error de red o
  // esquema no rompe la home — simplemente se usa el contenido local.
  const [services, processSteps, featuredCase, profileFeatures] =
    await Promise.all([
      getFeaturedServices(locale).catch(() => []),
      getProcessSteps(locale).catch(() => []),
      getFeaturedCaseForHome(locale).catch(() => null),
      getProfileFeatures(locale).catch(() => null),
    ]);

  const resolvedServices =
    services.length > 0 ? services : fallback.services;
  const resolvedProcess =
    processSteps.length > 0 ? processSteps : fallback.processSteps;
  const resolvedCase = featuredCase ?? fallback.featuredCase;
  const resolvedFeatures = profileFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <Services services={resolvedServices} />
        <About features={resolvedFeatures} />
        <Case caseStudy={resolvedCase} />
        <Process steps={resolvedProcess} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
