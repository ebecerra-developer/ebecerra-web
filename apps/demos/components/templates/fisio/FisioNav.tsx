import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
import FisioNavMobile from "./FisioNavMobile";
import styles from "./FisioNav.module.css";

export default async function FisioNav({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const t = await getTranslations("fisio");
  const logoUrl = demo.brand?.logo
    ? urlFor(demo.brand.logo).height(60).auto("format").url()
    : null;

  const items: { href: string; label: string }[] = [];
  if (demo.about) {
    items.push({ href: "#sobre", label: locale === "en" ? "About" : "Sobre" });
  }
  if (demo.services.length > 0) {
    items.push({
      href: "#servicios",
      label: locale === "en" ? "Services" : "Servicios",
    });
  }
  if (demo.team.length > 0) {
    items.push({
      href: "#equipo",
      label: locale === "en" ? "Team" : "Equipo",
    });
  }
  items.push({
    href: "#contacto",
    label: locale === "en" ? "Contact" : "Contacto",
  });

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#main" className={styles.brand} aria-label={t("ariaLogo")}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={demo.businessName}
              height={32}
              width={140}
              className={styles.brandLogo}
              priority
            />
          ) : (
            demo.businessName
          )}
        </a>

        <nav aria-label={t("ariaPrimaryNav")} className={styles.desktopNav}>
          <ul className={styles.menu}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.right}>
          {demo.enableEnglish && (
            <div className={styles.langSwitch}>
              <Link
                href={`/${demo.slug}`}
                locale="es"
                className={`${styles.langBtn} ${locale === "es" ? styles.langBtnActive : ""}`}
                aria-current={locale === "es" ? "page" : undefined}
              >
                ES
              </Link>
              <span className={styles.langSep} aria-hidden="true">
                /
              </span>
              <Link
                href={`/${demo.slug}`}
                locale="en"
                className={`${styles.langBtn} ${locale === "en" ? styles.langBtnActive : ""}`}
                aria-current={locale === "en" ? "page" : undefined}
              >
                EN
              </Link>
            </div>
          )}
          <a href="#contacto" className={styles.cta}>
            {t("callToAction")}
          </a>
          <FisioNavMobile
            brand={demo.businessName}
            items={items}
            ctaLabel={t("callToAction")}
            ctaHref="#contacto"
            ariaOpen={t("menuOpen")}
            ariaClose={t("menuClose")}
            ariaPrimaryNav={t("ariaPrimaryNav")}
            templateScope="fisio"
          />
        </div>
      </div>
    </header>
  );
}
