import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import EditorialNav from "./EditorialNav";
import EditorialHero from "./EditorialHero";
import EditorialStats from "./EditorialStats";
import EditorialAbout from "./EditorialAbout";
import EditorialServices from "./EditorialServices";
import EditorialLifestyleStrip from "./EditorialLifestyleStrip";
import EditorialBannerCta from "./EditorialBannerCta";
import EditorialPricing from "./EditorialPricing";
import EditorialTestimonials from "./EditorialTestimonials";
import EditorialBookingNote from "./EditorialBookingNote";
import EditorialContact from "./EditorialContact";
import EditorialFooter from "./EditorialFooter";
import DemoChatbot from "@/components/DemoChatbot";
import styles from "./EditorialTemplate.module.css";

/**
 * Plantilla editorial — femenino sofisticado, magazine spread.
 * No reusa componentes de fisio. Layout asimétrico, tipografía display
 * serif gigante, paleta dusty rose + burdeos + dark warm.
 *
 * Avatar objetivo: coach mujer 35-55 (perimenopausia, postparto, salud
 * hormonal). Captación por agenda + recomendación.
 */
export default function EditorialTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  return (
    <div className={styles.shell} data-template="coach-editorial">
      <EditorialNav demo={demo} locale={locale} />
      <main id="main">
        <EditorialHero demo={demo} />
        {demo.coachStats.length > 0 && <EditorialStats stats={demo.coachStats} />}
        {demo.about && <EditorialAbout about={demo.about} />}
        {demo.services.length > 0 && (
          <EditorialServices header={demo.servicesSection} services={demo.services} />
        )}
        {demo.lifestyleGallery.length > 0 && (
          <EditorialLifestyleStrip images={demo.lifestyleGallery} />
        )}
        <EditorialBannerCta demo={demo} />
        {demo.pricing?.enabled && <EditorialPricing pricing={demo.pricing} />}
        {demo.testimonials.length > 0 && (
          <EditorialTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}
        <EditorialBookingNote demo={demo} />
        {demo.contact && (
          <EditorialContact contact={demo.contact} services={demo.services} />
        )}
      </main>
      <EditorialFooter demo={demo} />
      <DemoChatbot demo={demo} locale={locale} />
    </div>
  );
}
