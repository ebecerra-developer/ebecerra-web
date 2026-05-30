import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import {
  getSiteData,
  getTechHomeSections,
  getTechContactForm,
} from "@ebecerra/sanity-client";
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

  const [sanity, home, contactForm] = await Promise.all([
    getSiteData(locale).catch(() => null),
    getTechHomeSections(locale),
    getTechContactForm(locale),
  ]);
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
        <Hero hero={home.hero} />
        <About chrome={home.about} features={featureItems} />
        <Experience chrome={home.experience} items={experienceItems} />
        <Skills chrome={home.skills} skills={skillItems} tags={tagItems} />
        <Projects chrome={home.projects} items={projectItems} />
        <Contact chrome={home.contact} form={contactForm} />
      </main>
      <Footer />
    </>
  );
}
