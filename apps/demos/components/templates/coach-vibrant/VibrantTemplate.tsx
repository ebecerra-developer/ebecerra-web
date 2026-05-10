import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import VibrantNav from "./VibrantNav";
import VibrantHero from "./VibrantHero";
import VibrantStats from "./VibrantStats";
import VibrantAbout from "./VibrantAbout";
import VibrantServices from "./VibrantServices";
import VibrantObjectives from "./VibrantObjectives";
import VibrantInstagramFeed from "./VibrantInstagramFeed";
import VibrantBannerCta from "./VibrantBannerCta";
import VibrantTestimonials from "./VibrantTestimonials";
import VibrantContact from "./VibrantContact";
import VibrantFooter from "./VibrantFooter";
import styles from "./VibrantTemplate.module.css";

/**
 * Plantilla vibrant — marca personal joven, energía, paleta magenta+lila+verde
 * ácido, layout social media moderno. NO reusa fisio/coach. Sin pricing
 * público (capta por DM), sin booking formal (WhatsApp). IG feed protagonista.
 */
export default function VibrantTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  return (
    <div className={styles.shell} data-template="coach-vibrant">
      <VibrantNav demo={demo} locale={locale} />
      <main id="main">
        <VibrantHero demo={demo} />
        {demo.coachStats.length > 0 && <VibrantStats stats={demo.coachStats} />}
        {demo.about && <VibrantAbout about={demo.about} />}
        {demo.services.length > 0 && (
          <VibrantServices header={demo.servicesSection} services={demo.services} />
        )}
        {demo.objectives.length > 0 && (
          <VibrantObjectives header={demo.objectivesSection} objectives={demo.objectives} />
        )}
        {demo.instagramFeed?.enabled && (
          <VibrantInstagramFeed feed={demo.instagramFeed} />
        )}
        <VibrantBannerCta demo={demo} />
        {demo.testimonials.length > 0 && (
          <VibrantTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}
        {demo.contact && <VibrantContact contact={demo.contact} />}
      </main>
      <VibrantFooter demo={demo} />
    </div>
  );
}
