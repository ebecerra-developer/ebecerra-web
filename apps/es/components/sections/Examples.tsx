import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedDemoSites } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import type { Locale } from "@/i18n/routing";
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

  const featured = demos.slice(0, 3);
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

        <div className={styles.grid}>
          {featured.map((demo) => {
            const thumbUrl = demo.thumbnail
              ? urlFor(demo.thumbnail).width(800).auto("format").url()
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
                <div
                  className={styles.thumb}
                  style={
                    thumbUrl
                      ? { backgroundImage: `url(${thumbUrl})` }
                      : undefined
                  }
                  role="img"
                  aria-label={demo.businessName}
                />
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
        </div>

        <div className={styles.viewAllWrap}>
          <Link href="/ejemplos" className={styles.viewAll}>
            {t("homeViewAll")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
