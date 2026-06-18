import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { getGestoriaContent } from "./content";
import GestoriaNav from "./GestoriaNav";
import GestoriaHero from "./GestoriaHero";
import GestoriaTrustBar from "./GestoriaTrustBar";
import GestoriaServices from "./GestoriaServices";
import GestoriaProcess from "./GestoriaProcess";
import GestoriaTeam from "./GestoriaTeam";
import GestoriaStats from "./GestoriaStats";
import GestoriaTestimonials from "./GestoriaTestimonials";
import GestoriaFaq from "./GestoriaFaq";
import GestoriaContact from "./GestoriaContact";
import GestoriaClose from "./GestoriaClose";
import GestoriaFooter from "./GestoriaFooter";
import GestoriaCookieNotice from "./GestoriaCookieNotice";
import DemoChatbot from "@/components/DemoChatbot";
import styles from "./GestoriaTemplate.module.css";

/**
 * Plantilla Gestoría — home one-page. Arco narrativo: caos (hero) → 3 pasos
 * (proceso) → tranquilidad (cierre). Sobria e institucional, con 2-3 momentos
 * wow (lío→orden, timeline scroll-driven, contadores) y microinteracciones.
 */
export default function GestoriaTemplate({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const content = getGestoriaContent(locale);

  return (
    <div className={styles.shell} data-template="gestoria">
      <GestoriaNav content={content} locale={locale} home langBase="/vega-asociados" />
      <main id="main">
        <GestoriaHero content={content} />
        <GestoriaTrustBar items={content.trust.items} srLabel={content.trust.srLabel} />
        <GestoriaServices content={content} locale={locale} />
        <GestoriaProcess content={content} />
        <GestoriaTeam content={content} team={demo.team ?? []} />
        <GestoriaStats content={content} />
        <GestoriaTestimonials content={content} />
        <GestoriaFaq
          kicker={content.faq.kicker}
          title={content.faq.title}
          lead={content.faq.lead}
          items={content.faq.items}
        />
        <GestoriaContact content={content} />
        <GestoriaClose content={content} />
      </main>
      <GestoriaFooter content={content} locale={locale} home />
      <GestoriaCookieNotice strings={content.cookies} />
      <DemoChatbot demo={demo} locale={locale} />
    </div>
  );
}
