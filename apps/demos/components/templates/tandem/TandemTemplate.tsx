import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import TandemNav from "./TandemNav";
import TandemHero from "./TandemHero";
import TandemMarquee from "./TandemMarquee";
import TandemServices from "./TandemServices";
import TandemDesignSpotlight from "./TandemDesignSpotlight";
import TandemProcess from "./TandemProcess";
import TandemTeam from "./TandemTeam";
import TandemTestimonials from "./TandemTestimonials";
import TandemBannerCta from "./TandemBannerCta";
import TandemContact from "./TandemContact";
import TandemFooter from "./TandemFooter";
import styles from "./TandemTemplate.module.css";

/**
 * Plantilla tándem — agencia joven de marketing digital. Fanzine 2026
 * editorial-playful: hueso + tinta + cobalto + coral. Bricolage chunky
 * + Instrument Serif italic en acentos. Sin pricing público, sin IG feed.
 * Sección "Diseño web" ampliada como anclaje de portfolio.
 */
export default function TandemTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  return (
    <div className={styles.shell} data-template="tandem">
      <TandemNav demo={demo} locale={locale} />
      <main id="main">
        <TandemHero demo={demo} />
        <TandemMarquee />
        {demo.services.length > 0 && (
          <TandemServices header={demo.servicesSection} services={demo.services} />
        )}
        <TandemDesignSpotlight demo={demo} />
        {demo.objectives.length > 0 && (
          <TandemProcess header={demo.objectivesSection} steps={demo.objectives} />
        )}
        {demo.testimonials.length > 0 && (
          <TandemTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}
        {demo.team.length > 0 && (
          <TandemTeam header={demo.teamSection} team={demo.team} />
        )}
        <TandemBannerCta />
        {demo.contact && <TandemContact contact={demo.contact} services={demo.services} />}
      </main>
      <TandemFooter demo={demo} />
    </div>
  );
}
