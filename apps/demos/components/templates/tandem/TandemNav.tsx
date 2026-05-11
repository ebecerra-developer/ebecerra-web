import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FisioNavMobile from "../fisio/FisioNavMobile";
import styles from "./TandemNav.module.css";

export default async function TandemNav({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const t = await getTranslations("fisio");

  const items: { href: string; label: string }[] = [
    { href: "#servicios", label: locale === "en" ? "Services" : "Servicios" },
    { href: "#diseno", label: locale === "en" ? "Web design" : "Diseño web" },
    { href: "#proceso", label: locale === "en" ? "Process" : "Proceso" },
    { href: "#nosotras", label: locale === "en" ? "About" : "Nosotras" },
    { href: "#contacto", label: locale === "en" ? "Contact" : "Hablamos" },
  ];

  const ctaLabel = locale === "en" ? "Let's talk →" : "Hablamos →";
  const ctaHref = "#contacto";

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#main" className={styles.brand}>
          <span>{demo.businessName}</span>
        </a>

        <nav aria-label={t("ariaPrimaryNav")} className={styles.desktopNav}>
          <ul className={styles.menu}>
            {items.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={styles.link}>
                  {item.label}
                </a>
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
              >
                ES
              </Link>
              <Link
                href={`/${demo.slug}`}
                locale="en"
                className={`${styles.langBtn} ${locale === "en" ? styles.langBtnActive : ""}`}
              >
                EN
              </Link>
            </div>
          )}
          <a href={ctaHref} className={styles.cta}>
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
            templateScope="tandem"
          />
        </div>
      </div>
    </header>
  );
}
