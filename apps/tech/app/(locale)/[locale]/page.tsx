import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import { getSiteData } from "@ebecerra/sanity-client";
import { getFallback } from "@/lib/content";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

export const revalidate = 3600;

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sanity = await getSiteData(locale).catch(() => null);
  const fallback = getFallback(locale);

  const experienceItems = sanity?.experience ?? fallback.experience;
  const skillItems = sanity?.skills ?? fallback.skills;
  const tagItems = sanity?.tags ?? fallback.tags;
  const projectItems = sanity?.projects ?? fallback.projects;
  const featureItems = sanity?.aboutFeatures ?? fallback.aboutFeatures;

  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About features={featureItems} />
        <Experience items={experienceItems} />
        <Skills skills={skillItems} tags={tagItems} />
        <Projects items={projectItems} />
        <Contact />
      </main>
      <Footer links={fallback.footerLinks} />
    </>
  );
}
