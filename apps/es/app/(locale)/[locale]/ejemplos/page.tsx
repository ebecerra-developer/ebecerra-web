import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  getPublishedDemoSites,
  getSiteSettingsFooter,
} from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import type { Locale } from "@/i18n/routing";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import PageHero from "@/components/sections/PageHero";
import styles from "./page.module.css";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "examples" });
  const baseUrl = "https://ebecerra.es";
  const canonical =
    locale === "es" ? `${baseUrl}/ejemplos/` : `${baseUrl}/${locale}/ejemplos/`;

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: `${baseUrl}/ejemplos/`,
        en: `${baseUrl}/en/ejemplos/`,
        "x-default": `${baseUrl}/ejemplos/`,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

const DEMOS_BASE_URL = "https://demos.ebecerra.es";

export default async function EjemplosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, demos, footerData] = await Promise.all([
    getTranslations("examples"),
    getPublishedDemoSites(locale as Locale),
    getSiteSettingsFooter(locale).catch(() => null),
  ]);

  const demoUrl = (slug: string) =>
    locale === "es"
      ? `${DEMOS_BASE_URL}/${slug}/`
      : `${DEMOS_BASE_URL}/${locale}/${slug}/`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: demos.map((demo, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: demoUrl(demo.slug),
      name: demo.businessName,
    })),
  };

  return (
    <>
      <Nav />
      <main id="main" className={styles.main}>
      <div className={styles.inner}>
        <PageHero
          kicker={t("kicker")}
          title={t("title")}
          lead={t("lead")}
        />

        {demos.length === 0 ? (
          <p className={styles.empty}>{t("emptyState")}</p>
        ) : (
          <ul className={styles.grid}>
            {demos.map((demo, i) => {
              const isLcpCandidate = i === 0;
              const thumbnail = demo.thumbnail;
              const thumb = thumbnail
                ? {
                    src: urlFor(thumbnail).width(800).auto("format").url(),
                    srcSet: [400, 600, 800, 1200]
                      .map(
                        (w) =>
                          `${urlFor(thumbnail).width(w).auto("format").url()} ${w}w`,
                      )
                      .join(", "),
                  }
                : null;
              return (
                <li key={demo._id}>
                  <a
                    className={styles.card}
                    href={demoUrl(demo.slug)}
                    target="_blank"
                    rel="noopener"
                    aria-label={`${t("viewDemo")}: ${demo.businessName} ${t("openInNewTab")}`}
                  >
                    <div className={styles.thumb}>
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb.src}
                          srcSet={thumb.srcSet}
                          sizes="(min-width: 900px) 400px, (min-width: 600px) 50vw, 92vw"
                          alt={demo.businessName}
                          loading={isLcpCandidate ? "eager" : "lazy"}
                          fetchPriority={isLcpCandidate ? "high" : undefined}
                          decoding="async"
                          width={800}
                          height={500}
                          className={styles.thumbImg}
                        />
                      )}
                    </div>
                    <div className={styles.body}>
                      {demo.sector && (
                        <p className={styles.sector}>{demo.sector}</p>
                      )}
                      <h2 className={styles.cardTitle}>{demo.businessName}</h2>
                      {demo.shortDescription && (
                        <p className={styles.cardDesc}>{demo.shortDescription}</p>
                      )}
                      <span className={styles.cardFooter}>
                        {t("viewDemo")} →
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.contactCta}>
          <p>
            {locale === "es"
              ? "¿Te encaja alguna? La tuya parte de una conversación."
              : "Does any of these fit? Yours starts with a conversation."}
          </p>
          <a href={`${locale === "es" ? "" : "/" + locale}/#contacto`}>
            {t("ctaContact")} →
          </a>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      </main>
      <Footer footerData={footerData} />
    </>
  );
}
