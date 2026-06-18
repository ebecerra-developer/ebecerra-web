import {
  getContactSectionMeta,
  getProfile,
  getPublishedDemoSites,
  type SectorLandingData,
} from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/sanity-image";
import PageHero from "@/components/sections/PageHero";
import Contact from "@/components/sections/Contact";
import FaqList from "@/components/faq/FaqList";
import TiltCard from "@/components/TiltCard";
import styles from "./SectorLanding.module.css";

const SITE_URL = "https://ebecerra.es";
const DEMOS_BASE_URL = "https://demos.ebecerra.es";

type Props = {
  data: SectorLandingData;
  locale: Locale;
};

/**
 * Cuerpo reutilizable de una landing de sector. La ruta (folder por sector)
 * solo trae el documento por slug y lo pasa aquí. Incluye el formulario de
 * contacto embebido (mismo componente que la home) con cierre propio del sector
 * y el JSON-LD Service + FAQPage.
 */
export default async function SectorLanding({ data, locale }: Props) {
  const isEs = locale === "es";
  const homeHref = isEs ? "/" : `/${locale}/`;
  const examplesHref = isEs ? "/ejemplos/" : `/${locale}/ejemplos/`;
  const canonical = isEs
    ? `${SITE_URL}/${data.slug}/`
    : `${SITE_URL}/${locale}/${data.slug}/`;

  const featured = data.featuredDemo;
  const [contactBase, profile, demos] = await Promise.all([
    getContactSectionMeta(locale),
    getProfile(locale).catch(() => null),
    featured
      ? getPublishedDemoSites(locale).catch(() => [])
      : Promise.resolve([]),
  ]);

  const featuredDemo = featured
    ? (demos.find((d) => d.slug === featured.demoSlug) ?? null)
    : null;
  const demoUrl = (slug: string) =>
    isEs ? `${DEMOS_BASE_URL}/${slug}/` : `${DEMOS_BASE_URL}/${locale}/${slug}/`;
  const featuredThumb = featuredDemo?.thumbnail
    ? urlFor(featuredDemo.thumbnail).width(1280).auto("format").url()
    : null;
  const demoHost = featuredDemo
    ? `demos.ebecerra.es/${featuredDemo.slug}`
    : null;

  // Reutiliza el formulario de la home (campos desde Sanity), con el cierre
  // propio del sector como título/lead.
  const contactMeta = {
    ...contactBase,
    title: data.closingTitle || contactBase.title,
    lead: data.closingBody || contactBase.lead,
  };

  // Service con audiencia del sector; provider referencia la entidad global
  // (#organization) — no se duplica la entidad.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name: data.title,
    serviceType: isEs
      ? "Diseño y desarrollo web para autónomos y pymes"
      : "Web design and development for freelancers and SMBs",
    description: data.metaDescription,
    url: canonical,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Madrid" },
      { "@type": "Country", name: "Spain" },
    ],
  };

  const faqLd =
    data.faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <main id="main" className={styles.main}>
        <div className={styles.inner}>
          <PageHero
            breadcrumbs={[
              { label: isEs ? "Inicio" : "Home", href: homeHref },
              { label: data.internalName },
            ]}
            kicker={data.kicker}
            title={data.title}
            lead={data.lead}
          />

          {data.intro.length > 0 && (
            <div className={styles.story}>
              {data.intro.map((p, i) => (
                <p key={i} className={styles.para}>
                  {p.text}
                </p>
              ))}
            </div>
          )}

          {data.services.length > 0 && (
            <section className={styles.block} aria-labelledby="sl-servicios">
              <h2 id="sl-servicios" className={styles.blockTitle}>
                {data.servicesTitle}
              </h2>
              <div className={styles.cardGrid}>
                {data.services.map((s, i) => (
                  <TiltCard key={i} className={styles.card}>
                    <span className={styles.cardStar} aria-hidden="true">
                      ✦
                    </span>
                    <h3 className={styles.cardTitle}>{s.title}</h3>
                    <p className={styles.cardBody}>{s.body}</p>
                  </TiltCard>
                ))}
              </div>
            </section>
          )}

          {data.reachBody.length > 0 && (
            <section className={styles.reach} aria-labelledby="sl-reach">
              <h2 id="sl-reach" className={styles.reachTitle}>
                {data.reachTitle}
              </h2>
              <div className={styles.reachBody}>
                {data.reachBody.map((p, i) => (
                  <p key={i} className={styles.reachPara}>
                    {p.text}
                  </p>
                ))}
              </div>
            </section>
          )}

          {data.diffItems.length > 0 && (
            <section className={styles.block} aria-labelledby="sl-diff">
              <h2 id="sl-diff" className={styles.blockTitle}>
                {data.diffTitle}
              </h2>
              <ul className={styles.diffList}>
                {data.diffItems.map((d, i) => (
                  <li key={i} className={styles.diffItem}>
                    <span className={styles.diffStar} aria-hidden="true">
                      ✦
                    </span>
                    <div>
                      <h3 className={styles.diffTitle}>{d.title}</h3>
                      <p className={styles.diffBody}>{d.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(data.examplesBody || featuredDemo) && (
            <section className={styles.examples} aria-labelledby="sl-examples">
              <h2 id="sl-examples" className={styles.examplesTitle}>
                {data.examplesTitle}
              </h2>
              {data.examplesBody && (
                <p className={styles.examplesBody}>{data.examplesBody}</p>
              )}

              {featured && featuredDemo && (
                <a
                  href={demoUrl(featuredDemo.slug)}
                  target="_blank"
                  rel="noopener"
                  className={styles.showcase}
                  aria-label={`${featured.ctaLabel}: ${featuredDemo.businessName}`}
                >
                  <span className={styles.browserBar} aria-hidden="true">
                    <span className={styles.browserDots}>
                      <span />
                      <span />
                      <span />
                    </span>
                    {demoHost && (
                      <span className={styles.browserUrl}>{demoHost}</span>
                    )}
                  </span>
                  <span className={styles.browserViewport}>
                    {featuredThumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredThumb}
                        alt={`Demo de web para ${featuredDemo.businessName}`}
                        loading="lazy"
                        decoding="async"
                        width={1280}
                        height={800}
                        className={styles.browserImg}
                      />
                    )}
                  </span>
                  <span className={styles.showcaseFooter}>
                    <span className={styles.showcaseMeta}>
                      {featured.eyebrow && (
                        <span className={styles.showcaseEyebrow}>
                          {featured.eyebrow}
                        </span>
                      )}
                      <span className={styles.showcaseName}>
                        {featuredDemo.businessName}
                      </span>
                    </span>
                    <span className={styles.showcaseCta}>
                      {featured.ctaLabel} →
                    </span>
                  </span>
                </a>
              )}

              <div className={styles.examplesMore}>
                <a href={examplesHref} className={styles.examplesLink}>
                  {data.examplesCtaLabel} →
                </a>
              </div>
            </section>
          )}

          {data.faqItems.length > 0 && (
            <section className={styles.faqSection} aria-labelledby="sl-faq">
              <h2 id="sl-faq" className={styles.blockTitle}>
                {data.faqTitle}
              </h2>
              <FaqList
                items={data.faqItems.map((q) => ({ q: q.question, a: q.answer }))}
              />
            </section>
          )}
        </div>

        {/* Mismo formulario que la home (campos desde Sanity), cierre del sector. */}
        <Contact contactMeta={contactMeta} profile={profile} />
      </main>
    </>
  );
}
