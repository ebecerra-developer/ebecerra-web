"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { GestoriaContent } from "./content";
import FisioNavMobile from "../fisio/FisioNavMobile";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaNav.module.css";

/**
 * Nav institucional: barra plana en desktop con dropdown de servicios (enlaces
 * REALES a las subpáginas) + switch de idioma fuera del hamburger (Regla 7) +
 * teléfono y WhatsApp clicables. En móvil, hamburguesa (reusa FisioNavMobile con
 * templateScope="gestoria") y barra sticky inferior de Llamar / WhatsApp.
 */
export default function GestoriaNav({
  content,
  locale,
  home,
  langBase,
}: {
  content: GestoriaContent;
  locale: Locale;
  /** true en la home (anclas locales); false en subpáginas (anclas a la home). */
  home: boolean;
  /** ruta sin prefijo de locale para el switch de idioma (ej. /vega-asociados). */
  langBase: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const ddRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!servicesOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  const homePath = locale === "en" ? "/en/vega-asociados" : "/vega-asociados";
  const anchor = (id: string) => (home ? `#${id}` : `${homePath}#${id}`);
  const nav = content.nav;
  const anchorLinks = nav.links.map((l) => ({
    label: l.label,
    href: l.href.startsWith("#") ? anchor(l.href.slice(1)) : l.href,
  }));

  // Lista plana para el drawer móvil: anclas + subpáginas.
  const mobileItems = [
    ...anchorLinks,
    ...nav.serviceLinks
      .filter((s) => !s.soon)
      .map((s) => ({ label: s.label, href: s.href })),
  ];

  const ctaHref = anchor("contacto");

  return (
    <>
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        <a href={home ? "#main" : homePath} className={styles.brand}>
          <span className={styles.monogram} aria-hidden="true">
            {content.brand.monogram}
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>{content.brand.name}</span>
            <span className={styles.brandSub}>
              {locale === "en" ? "Tax & business advisory" : "Gestoría · asesoría"}
            </span>
          </span>
        </a>

        <nav aria-label={nav.primaryNav} className={styles.desktopNav}>
          <ul className={styles.menu}>
            <li className={styles.ddWrap} ref={ddRef}>
              <button
                type="button"
                className={styles.ddTrigger}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
                onClick={() => setServicesOpen((v) => !v)}
              >
                {nav.servicesLabel}
                <span
                  className={`${styles.caret} ${servicesOpen ? styles.caretUp : ""}`}
                  aria-hidden="true"
                />
              </button>
              <div
                className={`${styles.dropdown} ${servicesOpen ? styles.dropdownOpen : ""}`}
              >
                <ul className={styles.ddList}>
                  {nav.serviceLinks.map((s) => (
                    <li key={s.label}>
                      {s.soon ? (
                        <span className={styles.ddSoon}>
                          {s.label}
                          <span className={styles.soonTag}>
                            {locale === "en" ? "Soon" : "Pronto"}
                          </span>
                        </span>
                      ) : (
                        <a
                          href={s.href}
                          className={styles.ddLink}
                          onClick={() => setServicesOpen(false)}
                        >
                          {s.label}
                        </a>
                      )}
                    </li>
                  ))}
                  <li>
                    <a
                      href={anchor("servicios")}
                      className={styles.ddAll}
                      onClick={() => setServicesOpen(false)}
                    >
                      {locale === "en" ? "All services" : "Ver todos los servicios"}
                    </a>
                  </li>
                </ul>
              </div>
            </li>
            {anchorLinks.slice(1).map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.right}>
          <div className={styles.langSwitch}>
            <Link
              href={langBase}
              locale="es"
              className={`${styles.langBtn} ${locale === "es" ? styles.langActive : ""}`}
              aria-current={locale === "es" ? "true" : undefined}
            >
              ES
            </Link>
            <span className={styles.langSep} aria-hidden="true">
              ·
            </span>
            <Link
              href={langBase}
              locale="en"
              className={`${styles.langBtn} ${locale === "en" ? styles.langActive : ""}`}
              aria-current={locale === "en" ? "true" : undefined}
            >
              EN
            </Link>
          </div>

          <a
            href={`tel:${content.phone.tel}`}
            className={styles.phone}
            aria-label={`${nav.callLabel} ${content.phone.display}`}
          >
            <GestoriaIcon name="phone" className={styles.phoneIcon} />
            <span className={styles.phoneNum}>{content.phone.display}</span>
          </a>

          <a href={ctaHref} className={styles.cta}>
            {nav.ctaLabel}
          </a>

          <FisioNavMobile
            brand={content.brand.name}
            items={mobileItems}
            ctaLabel={nav.ctaLabel}
            ctaHref={ctaHref}
            ariaOpen={nav.openMenu}
            ariaClose={nav.closeMenu}
            ariaPrimaryNav={nav.primaryNav}
            templateScope="gestoria"
          />
        </div>
      </div>
    </header>

      {/* Barra sticky inferior solo móvil: Llamar / WhatsApp siempre a mano.
          Fuera del <header> a propósito: el backdrop-filter del nav crearía un
          bloque contenedor y el position:fixed se anclaría al nav, no al viewport. */}
      <div className={styles.stickyCall} aria-hidden="false">
        <a href={`tel:${content.phone.tel}`} className={styles.stickyCallBtn}>
          <GestoriaIcon name="phone" className={styles.stickyIcon} />
          {nav.callLabel}
        </a>
        <a
          href={content.whatsapp.href}
          className={`${styles.stickyCallBtn} ${styles.stickyWa}`}
          target="_blank"
          rel="noopener"
        >
          <GestoriaIcon name="chat" className={styles.stickyIcon} />
          {nav.waLabel}
        </a>
      </div>
    </>
  );
}
