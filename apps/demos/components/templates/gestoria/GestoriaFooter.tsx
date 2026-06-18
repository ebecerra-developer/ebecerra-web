import type { GestoriaContent } from "./content";
import type { Locale } from "@/i18n/routing";
import styles from "./GestoriaFooter.module.css";

/**
 * Footer institucional con legal completo: datos fiscales (razón social, CIF,
 * domicilio), línea de colegiado, confidencialidad/RGPD, enlaces legales
 * (placeholder) y nota de demo. Una gestoría que no cumple en su web pierde
 * credibilidad: este footer demuestra el patrón.
 */
export default function GestoriaFooter({
  content,
  locale,
  home,
}: {
  content: GestoriaContent;
  locale: Locale;
  home: boolean;
}) {
  const f = content.footer;
  const homePath = locale === "en" ? "/en/vega-asociados" : "/vega-asociados";
  const anchor = (href: string) =>
    href.startsWith("#") ? (home ? href : `${homePath}${href}`) : href;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <a href={home ? "#main" : homePath} className={styles.brand}>
              <span className={styles.monogram} aria-hidden="true">
                {content.brand.monogram}
              </span>
              <span className={styles.brandName}>{content.brand.name}</span>
            </a>
            <p className={styles.tagline}>{f.tagline}</p>
            <p className={styles.colegiado}>{f.colegiadoLine}</p>
          </div>

          <nav className={styles.linksCol} aria-label={f.navTitle}>
            <h3 className={styles.colTitle}>{f.navTitle}</h3>
            <ul className={styles.linkList}>
              {content.nav.links.map((l) => (
                <li key={l.href}>
                  <a href={anchor(l.href)}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.linksCol} aria-label={f.servicesTitle}>
            <h3 className={styles.colTitle}>{f.servicesTitle}</h3>
            <ul className={styles.linkList}>
              {content.nav.serviceLinks.map((s) => (
                <li key={s.label}>
                  {s.soon ? (
                    <span className={styles.soon}>{s.label}</span>
                  ) : (
                    <a href={s.href}>{s.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.linksCol} aria-label={f.legalTitle}>
            <h3 className={styles.colTitle}>{f.legalTitle}</h3>
            <ul className={styles.linkList}>
              {f.legalLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.fiscal}>
          <h3 className={styles.fiscalTitle}>{f.fiscalTitle}</h3>
          <p className={styles.fiscalLines}>
            {f.fiscalLines.map((line, i) => (
              <span key={line}>
                {line}
                {i < f.fiscalLines.length - 1 && (
                  <span className={styles.sep} aria-hidden="true">
                    {" · "}
                  </span>
                )}
              </span>
            ))}
          </p>
          <p className={styles.confidentiality}>{f.confidentiality}</p>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {content.brand.foundedYear}–2026 · {f.copyright}
          </p>
          <a href={home ? "#main" : homePath} className={styles.backToTop}>
            {f.backToTop} ↑
          </a>
        </div>
        <p className={styles.demoNote}>{f.demoNote}</p>
      </div>
    </footer>
  );
}
