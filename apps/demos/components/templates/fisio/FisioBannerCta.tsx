import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioBannerCta.module.css";

/**
 * Banner full-bleed entre About y Services. Usa la imagen del about (o
 * hero como fallback) como background con overlay y un CTA prominente.
 */
export default async function FisioBannerCta({ demo }: { demo: DemoSite }) {
  if (!demo.tagline) return null;
  const t = await getTranslations("fisio");
  const ctaLabel = demo.hero?.ctaPrimary.label ?? t("callToAction");
  const ctaHref = demo.hero?.ctaPrimary.href ?? "#contacto";

  const bgSource = demo.about?.image ?? demo.hero?.image;
  const bgUrl = bgSource
    ? urlFor(bgSource).width(2000).auto("format").url()
    : null;

  return (
    <section className={styles.banner} aria-label={ctaLabel}>
      {bgUrl ? (
        <div className={styles.bgImage}>
          <Image src={bgUrl} alt="" fill sizes="100vw" quality={80} />
        </div>
      ) : (
        <div className={styles.bgFallback} aria-hidden="true" />
      )}

      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span>Tu primera sesión</span>
          </p>
          <p className={styles.headline}>{demo.tagline}</p>
        </div>
        <div className={styles.actions}>
          <a href={ctaHref} className={styles.cta}>
            {ctaLabel}
          </a>
          <p className={styles.note}>
            Sin compromiso. Si no te convence, no pagas.
          </p>
        </div>
      </div>
    </section>
  );
}
