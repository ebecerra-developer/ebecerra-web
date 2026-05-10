import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
import FisioNavMobile from "../fisio/FisioNavMobile";
import styles from "./EditorialNav.module.css";

/**
 * Nav editorial: tipo cabecera de revista. Brand en serif elegante,
 * separador horizontal, nav links centrados, sin sticky bar pesada.
 */
export default async function EditorialNav({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const t = await getTranslations("fisio");
  const logoUrl = demo.brand?.logo
    ? urlFor(demo.brand.logo).height(80).auto("format").url()
    : null;

  const items: { href: string; label: string }[] = [];
  if (demo.about) items.push({ href: "#sobre", label: locale === "en" ? "About" : "Sobre" });
  if (demo.services.length > 0) items.push({ href: "#servicios", label: locale === "en" ? "Services" : "Servicios" });
  if (demo.pricing?.enabled) items.push({ href: "#tarifas", label: locale === "en" ? "Rates" : "Tarifas" });
  items.push({ href: "#contacto", label: locale === "en" ? "Contact" : "Contacto" });

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#main" className={styles.brand}>
          {logoUrl ? (
            <Image src={logoUrl} alt={demo.businessName} height={40} width={180} priority />
          ) : (
            <span className={styles.brandText}>{demo.businessName}</span>
          )}
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
              <span aria-hidden="true">·</span>
              <Link href={`/${demo.slug}`} locale="en" className={`${styles.langBtn} ${locale === "en" ? styles.langBtnActive : ""}`}>EN</Link>
            </div>
          )}
          <a href="#contacto" className={styles.cta}>{locale === "en" ? "Book session" : "Reservar sesión"}</a>
          <FisioNavMobile
            brand={demo.businessName}
            items={items}
            ctaLabel={locale === "en" ? "Book session" : "Reservar sesión"}
            ctaHref="#contacto"
            ariaOpen={t("menuOpen")}
            ariaClose={t("menuClose")}
            ariaPrimaryNav={t("ariaPrimaryNav")}
          />
        </div>
      </div>
      <div className={styles.divider} aria-hidden="true" />
    </header>
  );
}
