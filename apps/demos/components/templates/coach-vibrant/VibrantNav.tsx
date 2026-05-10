import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FisioNavMobile from "../fisio/FisioNavMobile";
import styles from "./VibrantNav.module.css";

/**
 * Nav vibrant: pill flotante en mobile, top bar con CTA pill saturado
 * en desktop. Brand handle-style con @ delante.
 */
export default async function VibrantNav({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const t = await getTranslations("fisio");
  const handle = demo.instagramFeed?.handle ?? null;
  const igUrl = handle ? `https://www.instagram.com/${handle}/` : null;

  const items: { href: string; label: string }[] = [];
  if (demo.about) items.push({ href: "#sobre", label: locale === "en" ? "About" : "Sobre" });
  if (demo.services.length > 0) items.push({ href: "#servicios", label: locale === "en" ? "Services" : "Servicios" });
  if (demo.instagramFeed?.enabled) items.push({ href: "#instagram", label: "Instagram" });
  items.push({ href: "#contacto", label: locale === "en" ? "Contact" : "Hablamos" });

  const ctaLabel = igUrl ? "DM en Instagram ↗" : (locale === "en" ? "Let's talk" : "Hablamos");
  const ctaHref = igUrl ?? "#contacto";

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#main" className={styles.brand}>
          <span className={styles.brandAt}>@</span>
          <span className={styles.brandHandle}>{handle ?? demo.businessName.toLowerCase().replace(/\s+/g, "")}</span>
        </a>

        <nav aria-label={t("ariaPrimaryNav")} className={styles.desktopNav}>
          <ul className={styles.menu}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.right}>
          {demo.enableEnglish && (
            <div className={styles.langSwitch}>
              <Link href={`/${demo.slug}`} locale="es" className={`${styles.langBtn} ${locale === "es" ? styles.langBtnActive : ""}`}>ES</Link>
              <Link href={`/${demo.slug}`} locale="en" className={`${styles.langBtn} ${locale === "en" ? styles.langBtnActive : ""}`}>EN</Link>
            </div>
          )}
          <a
            href={ctaHref}
            className={styles.cta}
            target={igUrl ? "_blank" : undefined}
            rel={igUrl ? "noopener noreferrer" : undefined}
          >
            {ctaLabel}
          </a>
          <FisioNavMobile
            brand={demo.businessName}
            items={items}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
            ariaOpen={t("menuOpen")}
            ariaClose={t("menuClose")}
            ariaPrimaryNav={t("ariaPrimaryNav")}
            templateScope="coach-vibrant"
          />
        </div>
      </div>
    </header>
  );
}
