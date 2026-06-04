import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getLandingMadrid } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import FaqList from "@/components/faq/FaqList";
import FaqContactBlock from "@/components/faq/FaqContactBlock";
import TiltCard from "@/components/TiltCard";
import styles from "./page.module.css";

export const revalidate = 1800;

const SITE_URL = "https://ebecerra.es";
const PATH = "/diseno-web-madrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const page = await getLandingMadrid(locale as Locale);
  const canonical =
    locale === "es" ? `${SITE_URL}${PATH}/` : `${SITE_URL}/${locale}${PATH}/`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical,
      languages: {
        es: `${SITE_URL}${PATH}/`,
        en: `${SITE_URL}/en${PATH}/`,
        "x-default": `${SITE_URL}${PATH}/`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function DisenoWebMadridPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getLandingMadrid(locale as Locale);

  const isEs = locale === "es";
  const homeHref = isEs ? "/" : `/${locale}/`;
  const contactHref = isEs ? "/#contacto" : `/${locale}/#contacto`;
  const examplesHref = isEs ? "/ejemplos/" : `/${locale}/ejemplos/`;
  const canonical = isEs ? `${SITE_URL}${PATH}/` : `${SITE_URL}/${locale}${PATH}/`;

  // Service con areaServed Madrid. provider referencia la entidad
  // ProfessionalService global (#organization) — no se duplica la entidad.
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonical}#service`,
    name: page.title,
    serviceType: isEs
      ? "Diseño y desarrollo web para autónomos y pymes"
      : "Web design and development for freelancers and SMBs",
    description: page.metaDescription,
    url: canonical,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: [
      { "@type": "City", name: "Madrid" },
      { "@type": "Country", name: "Spain" },
    ],
    audience: {
      "@type": "BusinessAudience",
      audienceType: isEs
        ? "Autónomos y pequeñas y medianas empresas"
        : "Freelancers and small-to-medium businesses",
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <Nav />
      <main id="main" className={styles.main}>
        <div className={styles.inner}>
          <PageHero
            breadcrumbs={[
              { label: isEs ? "Inicio" : "Home", href: homeHref },
              { label: isEs ? "Diseño web Madrid" : "Web design Madrid" },
            ]}
            kicker={page.kicker}
            title={page.title}
            lead={page.lead}
          />

          {page.intro.length > 0 && (
            <div className={styles.story}>
              {page.intro.map((p, i) => (
                <p key={i} className={styles.para}>
                  {p.text}
                </p>
              ))}
            </div>
          )}

          {page.services.length > 0 && (
            <section className={styles.block} aria-labelledby="lm-servicios">
              <h2 id="lm-servicios" className={styles.blockTitle}>
                {page.servicesTitle}
              </h2>
              <div className={styles.cardGrid}>
                {page.services.map((s, i) => (
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

          {page.reachBody.length > 0 && (
            <section className={styles.reach} aria-labelledby="lm-reach">
              <h2 id="lm-reach" className={styles.reachTitle}>
                {page.reachTitle}
              </h2>
              <div className={styles.reachBody}>
                {page.reachBody.map((p, i) => (
                  <p key={i} className={styles.reachPara}>
                    {p.text}
                  </p>
                ))}
              </div>
            </section>
          )}

          {page.diffItems.length > 0 && (
            <section className={styles.block} aria-labelledby="lm-diff">
              <h2 id="lm-diff" className={styles.blockTitle}>
                {page.diffTitle}
              </h2>
              <ul className={styles.diffList}>
                {page.diffItems.map((d, i) => (
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

          <section className={styles.examples} aria-labelledby="lm-examples">
            <h2 id="lm-examples" className={styles.examplesTitle}>
              {page.examplesTitle}
            </h2>
            <p className={styles.examplesBody}>{page.examplesBody}</p>
            <a href={examplesHref} className={styles.examplesLink}>
              {page.examplesCtaLabel} →
            </a>
          </section>

          {page.faqItems.length > 0 && (
            <section className={styles.faqSection} aria-labelledby="lm-faq">
              <h2 id="lm-faq" className={styles.blockTitle}>
                {page.faqTitle}
              </h2>
              <FaqList
                items={page.faqItems.map((q) => ({ q: q.question, a: q.answer }))}
              />
            </section>
          )}

          <FaqContactBlock
            title={page.closingTitle}
            lead={page.closingBody}
            cta={page.closingCtaLabel}
            href={contactHref}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
