import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import ExpedicionBackToTop from "./ExpedicionBackToTop";
import styles from "./ExpedicionFooter.module.css";

export default function ExpedicionFooter({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const es = locale === "es";
  const year = new Date().getFullYear();
  const links = [
    { href: "#actividades", label: es ? "Actividades" : "Activities" },
    { href: "#experiencia", label: es ? "La experiencia" : "Experience" },
    { href: "#guias", label: es ? "Guías" : "Guides" },
    { href: "#contacto", label: es ? "Reservar" : "Book" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.closing}>
        <div className={styles.closingText}>
          <p className={styles.closingKicker}>
            {es ? "La sierra te espera" : "The mountains are calling"}
          </p>
          <p className={styles.closingLine}>
            {es ? (
              <>
                ¿Te vienes a la <span className={styles.hl}>próxima ruta</span>?
              </>
            ) : (
              <>
                Ready for your <span className={styles.hl}>next route</span>?
              </>
            )}
          </p>
          <a href="#contacto" className={styles.closingCta}>
            {es ? "Reservar tu aventura" : "Book your adventure"}
            <span aria-hidden="true">→</span>
          </a>
        </div>
        <ExpedicionBackToTop label={es ? "Volver arriba" : "Back to top"} />
      </div>

      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <p className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true" />
            {demo.businessName}
          </p>
          {demo.tagline && <p className={styles.tagline}>{demo.tagline}</p>}
        </div>

        <nav
          className={styles.nav}
          aria-label={es ? "Pie de página" : "Footer"}
        >
          <ul className={styles.navList}>
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={styles.navLink}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className={styles.bottom}>
        <p className={styles.demo}>
          {es
            ? "Web de demostración · No representa un negocio real."
            : "Demo website · Not a real business."}
        </p>
        <p className={styles.copy}>
          © {year} {demo.businessName} — {es ? "demo de" : "demo by"}{" "}
          <a href="https://ebecerra.es" target="_blank" rel="noopener noreferrer">
            ebecerra.es
          </a>
        </p>
      </div>
    </footer>
  );
}
