import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedDemoSites } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import type { Locale } from "@/i18n/routing";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Demos",
  robots: { index: false, follow: false },
};

export default async function DemosIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("indexPage");
  const demos = await getPublishedDemoSites(locale as Locale);

  return (
    <main id="main" className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>{t("title")}</h1>
          <p className={styles.headerLead}>{t("lead")}</p>
        </header>

        {demos.length === 0 ? (
          <p className={styles.empty}>(Sin demos publicadas)</p>
        ) : (
          <ul className={styles.grid}>
            {demos.map((demo) => {
              const thumbUrl = demo.thumbnail
                ? urlFor(demo.thumbnail).width(800).auto("format").url()
                : null;
              return (
                <li key={demo._id}>
                  <Link href={`/${demo.slug}`} className={styles.card}>
                    {thumbUrl && (
                      <div
                        className={styles.cardThumb}
                        style={{ backgroundImage: `url(${thumbUrl})` }}
                        role="img"
                        aria-label={demo.businessName}
                      />
                    )}
                    <div className={styles.cardBody}>
                      {demo.sector && <p className={styles.cardSector}>{demo.sector}</p>}
                      <h2 className={styles.cardTitle}>{demo.businessName}</h2>
                      {demo.shortDescription && (
                        <p className={styles.cardDesc}>{demo.shortDescription}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.footer}>
          <a href="https://ebecerra.es" className={styles.backLink}>
            ← {t("ctaBack")}
          </a>
        </div>
      </div>
    </main>
  );
}
