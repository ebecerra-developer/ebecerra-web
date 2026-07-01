import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import BeeMovementNav from "./BeeMovementNav";
import BeeMovementHero from "./BeeMovementHero";
import BeeMovementAbout from "./BeeMovementAbout";
import BeeMovementLifestyle from "./BeeMovementLifestyle";
import BeeMovementServices from "./BeeMovementServices";
import BeeMovementBooking from "./BeeMovementBooking";
import BeeMovementTeam from "./BeeMovementTeam";
import BeeMovementTestimonials from "./BeeMovementTestimonials";
import BeeMovementFaq from "./BeeMovementFaq";
import BeeMovementContact from "./BeeMovementContact";
import BeeMovementFooter from "./BeeMovementFooter";
import BeeMovementWhatsappFloat from "./BeeMovementWhatsappFloat";
import styles from "./BeeMovementTemplate.module.css";

export default function BeeMovementTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const whatsapp = demo.contact?.social.find((s) => s.name === "WhatsApp");

  return (
    <div className={styles.shell} data-template="beemovement">
      <BeeMovementNav demo={demo} locale={locale} />
      <main id="main">
        <BeeMovementHero demo={demo} />
        {demo.about && <BeeMovementAbout about={demo.about} />}
        <BeeMovementLifestyle images={demo.lifestyleGallery} />
        {demo.services.length > 0 && (
          <BeeMovementServices
            header={demo.servicesSection}
            services={demo.services}
          />
        )}
        <BeeMovementBooking />
        {demo.team.length > 0 && (
          <BeeMovementTeam
            header={demo.teamSection}
            team={demo.team}
            slug={demo.slug}
          />
        )}
        {demo.testimonials.length > 0 && (
          <BeeMovementTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}
        <BeeMovementFaq />
        {demo.contact && <BeeMovementContact contact={demo.contact} />}
      </main>
      <BeeMovementFooter demo={demo} />
      {whatsapp?.url && <BeeMovementWhatsappFloat href={whatsapp.url} />}
    </div>
  );
}
