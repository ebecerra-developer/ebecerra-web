import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
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
        <nav aria-label={t("ariaPrimaryNav")}>
          <ul className={styles.menu}>
            {demo.about && (
              <li>
                <a href="#sobre">{locale === "en" ? "About" : "Sobre"}</a>
              </li>
            )}
            {demo.services.length > 0 && (
              <li>
                <a href="#servicios">
                  {locale === "en" ? "Services" : "Servicios"}
                </a>
              </li>
            )}
            {demo.team.length > 0 && (
              <li>
                <a href="#equipo">{locale === "en" ? "Team" : "Equipo"}</a>
              </li>
            )}
            <li>
              <a href="#contacto">
                {locale === "en" ? "Contact" : "Contacto"}
              </a>
            </li>
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
              <span className={styles.langSep} aria-hidden="true">/</span>
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
        </div>
      </div>
    </header>
  );
}
