import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FisioNav from "./FisioNav";
import FisioHero from "./FisioHero";
import FisioAbout from "./FisioAbout";
import FisioServices from "./FisioServices";
import FisioTeam from "./FisioTeam";
import FisioTestimonials from "./FisioTestimonials";
import FisioContact from "./FisioContact";
import FisioFooter from "./FisioFooter";
import styles from "./FisioTemplate.module.css";

export default function FisioTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  return (
    <div className={styles.shell} data-template="fisio">
      <FisioNav demo={demo} locale={locale} />
      <main id="main">
        <FisioHero demo={demo} />
        {demo.about && <FisioAbout about={demo.about} />}
        {demo.services.length > 0 && (
          <FisioServices header={demo.servicesSection} services={demo.services} />
        )}
        {demo.team.length > 0 && (
          <FisioTeam header={demo.teamSection} team={demo.team} />
        )}
        {demo.testimonials.length > 0 && (
          <FisioTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}
        {demo.contact && <FisioContact contact={demo.contact} />}
      </main>
      <FisioFooter demo={demo} />
    </div>
  );
}
