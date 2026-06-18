import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaServices.module.css";

/**
 * Servicios: cuatro áreas troncales (resumen, sin link) + "caminos" por
 * situación que enlazan a su subpágina (o marcan "próximamente") + bloque de
 * digitalización (portal del cliente / firma electrónica), el diferenciador
 * frente a la gestoría de "tráeme los papeles en una carpeta".
 */
export default function GestoriaServices({
  content,
  locale,
}: {
  content: GestoriaContent;
  locale: "es" | "en";
}) {
  const s = content.services;
  const soonLabel = locale === "en" ? "Coming soon" : "Próximamente";

  return (
    <section id="servicios" className={styles.section} aria-labelledby="services-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {s.kicker}
          </p>
          <h2 id="services-heading" className={styles.title}>
            {s.title}
          </h2>
          <p className={styles.lead}>{s.lead}</p>
        </header>

        {/* Áreas troncales */}
        <h3 className={styles.subhead}>{s.areasTitle}</h3>
        <ul className={styles.areas}>
          {s.areas.map((a) => (
            <li key={a.title} className={styles.areaCard}>
              <span className={styles.areaIcon} aria-hidden="true">
                <GestoriaIcon name={a.icon} className={styles.areaIconSvg} />
              </span>
              <h4 className={styles.areaTitle}>{a.title}</h4>
              <p className={styles.areaProblem}>{a.problem}</p>
            </li>
          ))}
        </ul>

        {/* Caminos por situación → subpáginas */}
        <div className={styles.pathsHead}>
          <h3 className={styles.subhead}>{s.pathsTitle}</h3>
          <p className={styles.pathsLead}>{s.pathsLead}</p>
        </div>
        <ul className={styles.paths}>
          {s.paths.map((p) => {
            const inner = (
              <>
                <span className={styles.pathTop}>
                  <span className={styles.pathIcon} aria-hidden="true">
                    <GestoriaIcon name={p.icon} className={styles.pathIconSvg} />
                  </span>
                  {p.soon && <span className={styles.soon}>{soonLabel}</span>}
                </span>
                <h4 className={styles.pathTitle}>{p.title}</h4>
                <p className={styles.pathProblem}>{p.problem}</p>
                <span className={styles.pathCta}>
                  {p.cta}
                  {!p.soon && (
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              </>
            );
            return p.href && !p.soon ? (
              <li key={p.title}>
                <a href={p.href} className={`${styles.pathCard} ${styles.pathLink}`}>
                  {inner}
                </a>
              </li>
            ) : (
              <li key={p.title}>
                <div className={`${styles.pathCard} ${styles.pathSoon}`}>{inner}</div>
              </li>
            );
          })}
        </ul>

        {/* Digitalización */}
        <div className={styles.digital}>
          <div className={styles.digitalText}>
            <h3 className={styles.digitalTitle}>{s.digitalTitle}</h3>
            <p className={styles.digitalBody}>{s.digitalBody}</p>
          </div>
          <ul className={styles.digitalList}>
            {s.digitalBullets.map((b) => (
              <li key={b} className={styles.digitalItem}>
                <GestoriaIcon name="check" className={styles.digitalCheck} />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
