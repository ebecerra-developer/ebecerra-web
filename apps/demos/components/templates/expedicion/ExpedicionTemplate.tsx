import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import ExpedicionNav from "./ExpedicionNav";
import ExpedicionImmersiveStage from "./ExpedicionImmersiveStage";
import ExpedicionImmersive from "./ExpedicionImmersive";
import ExpedicionActivities from "./ExpedicionActivities";
import ExpedicionAbout from "./ExpedicionAbout";
import ExpedicionGuides from "./ExpedicionGuides";
import ExpedicionTestimonials from "./ExpedicionTestimonials";
import ExpedicionBannerCta from "./ExpedicionBannerCta";
import ExpedicionContact from "./ExpedicionContact";
import ExpedicionFooter from "./ExpedicionFooter";
import DemoChatbot from "@/components/DemoChatbot";
import styles from "./ExpedicionTemplate.module.css";

/**
 * Plantilla Expedición — turismo activo / aventura (marca demo "Bravío").
 *
 * Experiencia inmersiva: el fondo POV avanza con el scroll y el contenido pasa
 * por ESCENAS centradas con cross-fade (no scroll de documento). Toda la
 * orquestación vive en ExpedicionImmersiveStage; cada hijo es una escena. En
 * móvil / prefers-reduced-motion degrada a scroll normal con póster fijo.
 */
export default function ExpedicionTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const es = locale === "es";
  return (
    <div className={styles.shell} data-template="expedicion">
      <ExpedicionNav demo={demo} locale={locale} />

      <main id="main">
        <ExpedicionImmersiveStage scrollLabel={es ? "Baja" : "Scroll"}>
          {demo.hero?.heading ? (
            <ExpedicionImmersive hero={demo.hero} />
          ) : null}
        {demo.services.length > 0 ? (
          <ExpedicionActivities
            header={demo.servicesSection}
            activities={demo.services}
            locale={locale}
          />
        ) : null}
        {demo.about ? <ExpedicionAbout about={demo.about} /> : null}
        {demo.team.length > 0 ? (
          <ExpedicionGuides header={demo.teamSection} team={demo.team} />
        ) : null}
        {demo.testimonials.length > 0 ? (
          <ExpedicionTestimonials
            header={demo.testimonialsSection}
            testimonials={demo.testimonials}
          />
        ) : null}
        <ExpedicionBannerCta businessName={demo.businessName} locale={locale} />
        {demo.contact ? (
          <ExpedicionContact
            contact={demo.contact}
            services={demo.services}
            locale={locale}
          />
        ) : null}
        </ExpedicionImmersiveStage>

        {/* El footer NO es una escena: bloque normal con z-index por encima del
            stage fijo, así sube y se muestra como un pie tradicional al final. */}
        <ExpedicionFooter demo={demo} locale={locale} />
      </main>

      <DemoChatbot demo={demo} locale={locale} />
    </div>
  );
}
