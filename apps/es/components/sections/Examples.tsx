import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedDemoSites } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import type { Locale } from "@/i18n/routing";
import ExamplesCarousel from "./ExamplesCarousel";
import styles from "./Examples.module.css";

const DEMOS_BASE_URL = "https://demos.ebecerra.es";

type Props = {
  locale: Locale;
};

export default async function Examples({ locale }: Props) {
  const [t, demos] = await Promise.all([
    getTranslations("examples"),
    getPublishedDemoSites(locale),
  ]);

  if (demos.length === 0) return null;

  const demoUrl = (slug: string) =>
    locale === "es"
      ? `${DEMOS_BASE_URL}/${slug}/`
      : `${DEMOS_BASE_URL}/${locale}/${slug}/`;

  return (
    <section
      id="ejemplos"
      aria-labelledby="examples-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>
          {"// "}
          <span className={styles.kickerAccent}>05.</span>{" "}
          {t("homeKicker").replace(/^\/\/\s*\d*\.?\s*/i, "")}
        </div>
        <h2 id="examples-heading" className={styles.heading}>
          {t("homeTitle")}
        </h2>
        <p className={`lead ${styles.lead}`}>{t("homeLead")}</p>

        <ExamplesCarousel
          prevLabel={t("prev")}
          nextLabel={t("next")}
        >
          {demos.map((demo) => {
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
              <a
                key={demo._id}
                href={demoUrl(demo.slug)}
                target="_blank"
                rel="noopener"
                className={styles.card}
                aria-label={`${t("viewDemo")}: ${demo.businessName} ${t("openInNewTab")}`}
              >
                <div className={styles.thumb}>
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.src}
                      srcSet={thumb.srcSet}
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 90vw"
                      alt={demo.businessName}
                      loading="lazy"
                      decoding="async"
                      width={800}
                      height={500}
                      className={styles.thumbImg}
                    />
                  )}
                </div>
                <div className={styles.body}>
                  {demo.sector && (
                    <span className={styles.sector}>{demo.sector}</span>
                  )}
                  <h3 className={styles.cardTitle}>{demo.businessName}</h3>
                  {demo.shortDescription && (
                    <p className={styles.cardDesc}>{demo.shortDescription}</p>
                  )}
                  <span className={styles.cardCta}>
                    {t("viewDemo")} →
                  </span>
                </div>
              </a>
            );
          })}
        </ExamplesCarousel>

        <div className={styles.viewAllWrap}>
          <Link href="/ejemplos" className={styles.viewAll}>
            {t("homeViewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
