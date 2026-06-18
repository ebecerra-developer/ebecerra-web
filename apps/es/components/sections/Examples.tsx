import { Link } from "@/i18n/navigation";
import {
  getPublishedDemoSites,
  getExamplesPage,
} from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import type { Locale } from "@/i18n/routing";
import ExamplesStage from "./ExamplesStage";
import Kicker from "@/components/Kicker";
import TiltCard from "@/components/TiltCard";
import styles from "./Examples.module.css";

const DEMOS_BASE_URL = "https://demos.ebecerra.es";

type Props = {
  locale: Locale;
};

export default async function Examples({ locale }: Props) {
  const [page, demos] = await Promise.all([
    getExamplesPage(locale),
    getPublishedDemoSites(locale),
  ]);

  if (demos.length === 0) return null;

  // En la home solo un selección curada (máx 5, por galleryOrder); todas en /ejemplos.
  const homeDemos = demos.slice(0, 5);

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
        <Kicker>{page.homeKicker}</Kicker>
        <h2 id="examples-heading" className={styles.heading}>
          {page.homeTitle}
        </h2>
        <p className={`lead ${styles.lead}`}>{page.homeLead}</p>
      </div>

      <ExamplesStage>
          {homeDemos.map((demo) => {
            const thumbnail = demo.thumbnail;
            const thumb = thumbnail
              ? {
                  src: urlFor(thumbnail).width(1200).auto("format").url(),
                  srcSet: [480, 640, 900, 1200, 1600]
                    .map(
                      (w) =>
                        `${urlFor(thumbnail).width(w).auto("format").url()} ${w}w`,
                    )
                    .join(", "),
                }
              : null;
            return (
              <TiltCard
                as="a"
                key={demo._id}
                href={demoUrl(demo.slug)}
                target="_blank"
                rel="noopener"
                className={styles.card}
                ariaLabel={`${page.viewDemoLabel}: ${demo.businessName} ${page.openInNewTabLabel}`}
              >
                <div className={styles.thumb}>
                  {thumb && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb.src}
                      srcSet={thumb.srcSet}
                      sizes="(min-width: 900px) 560px, (min-width: 640px) 380px, 85vw"
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
                    {page.viewDemoLabel} →
                  </span>
                </div>
              </TiltCard>
            );
          })}
      </ExamplesStage>

      <div className={styles.inner}>
        <div className={styles.viewAllWrap}>
          <Link href="/ejemplos" className={styles.viewAll}>
            {page.homeViewAll} →
          </Link>
        </div>
      </div>
    </section>
  );
}
