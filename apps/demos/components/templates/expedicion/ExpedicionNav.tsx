import { Link } from "@/i18n/navigation";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import FisioNavMobile from "../fisio/FisioNavMobile";
import styles from "./ExpedicionNav.module.css";

/**
 * Nav de Expedición: fijo y constante sobre la experiencia inmersiva (no cambia
 * con el scroll, porque la página no scrollea como un documento). Texto claro
 * con un velo superior para legibilidad. Reusa el drawer mobile con templateScope.
 */
export default function ExpedicionNav({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const es = locale === "es";

  const items = [
    { href: "#actividades", label: es ? "Actividades" : "Activities" },
    { href: "#experiencia", label: es ? "La experiencia" : "Experience" },
    { href: "#guias", label: es ? "Guías" : "Guides" },
    { href: "#opiniones", label: es ? "Opiniones" : "Reviews" },
  ];
  const ctaLabel = es ? "Reservar" : "Book";
  const ctaHref = "#contacto";

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a href="#main" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          {demo.businessName}
        </a>

        <nav
          aria-label={es ? "Navegación principal" : "Primary navigation"}
          className={styles.desktopNav}
        >
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
            ariaOpen={es ? "Abrir menú" : "Open menu"}
            ariaClose={es ? "Cerrar menú" : "Close menu"}
            ariaPrimaryNav={es ? "Menú" : "Menu"}
            templateScope="expedicion"
          />
        </div>
      </div>
    </header>
  );
}
