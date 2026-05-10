import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
// Componentes reutilizados de la plantilla fisio (sin fork — misma data shape)
import FisioNav from "../fisio/FisioNav";
import FisioHero from "../fisio/FisioHero";
import FisioAbout from "../fisio/FisioAbout";
import FisioBannerCta from "../fisio/FisioBannerCta";
import FisioServices from "../fisio/FisioServices";
import FisioTestimonials from "../fisio/FisioTestimonials";
import FisioBooking from "../fisio/FisioBooking";
import FisioContact from "../fisio/FisioContact";
import FisioFooter from "../fisio/FisioFooter";
// Componentes específicos de coach (nuevos)
import CoachStats from "./CoachStats";
import CoachObjectives from "./CoachObjectives";
import CoachPricing from "./CoachPricing";
import CoachInstagramFeed from "./CoachInstagramFeed";
import { brandStyle } from "./brand";
import styles from "./CoachTemplate.module.css";

export default function CoachTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  return (
    <div
      className={styles.shell}
      data-template="coach"
      style={brandStyle(demo.brand)}
    >
      <FisioNav demo={demo} locale={locale} />
      <main id="main">
        {/* 01. Hero */}
        <FisioHero demo={demo} />

        {/* 02. Stats / credenciales numeradas — específico coach */}
        <CoachStats demo={demo} />

        {/* 03. About / filosofía */}
        {demo.about && <FisioAbout about={demo.about} />}

        {/* 04. Servicios / programas */}
        {demo.services.length > 0 && (
          <FisioServices header={demo.servicesSection} services={demo.services} />
        )}

        {/* 05. Banner CTA intermedio */}
        <FisioBannerCta demo={demo} />

        {/* 06. Objetivos / Para quién — específico coach */}
        <CoachObjectives demo={demo} />

        {/* 07. Precios públicos en bonos — específico coach (opcional vía flag) */}
        <CoachPricing demo={demo} />

        {/* 08. Testimonios */}
        {demo.testimonials.length > 0 && (
          <FisioTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        )}

        {/* 09. Feed Instagram — específico coach (opcional vía flag) */}
        <CoachInstagramFeed demo={demo} />

        {/* 10. Booking / disponibilidad */}
        <FisioBooking />

        {/* 11. Contacto */}
        {demo.contact && (
          <FisioContact contact={demo.contact} services={demo.services} />
        )}
      </main>
      {/* 12. Footer */}
      <FisioFooter demo={demo} />
    </div>
  );
}
