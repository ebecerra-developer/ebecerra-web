import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./VibrantBannerCta.module.css";

export default function VibrantBannerCta({ demo }: { demo: DemoSite }) {
  if (!demo.tagline) return null;
  const igHandle = demo.instagramFeed?.handle ?? null;
  const ctaLabel = igHandle ? `DM en Instagram ↗` : (demo.hero?.ctaPrimary?.label ?? "Hablamos");
  const ctaHref = igHandle ? `https://www.instagram.com/${igHandle}/` : (demo.hero?.ctaPrimary?.href ?? "#contacto");
  const isExternal = ctaHref.startsWith("http");
  return (
    <section className={styles.banner} aria-label={ctaLabel}>
      <div className={styles.inner}>
        <p className={styles.headline}>{demo.tagline}</p>
        <a
          href={ctaHref}
          className={styles.cta}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
