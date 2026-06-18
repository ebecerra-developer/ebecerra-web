import type { GestoriaContent, ServiceDetail } from "./content";
import type { Locale } from "@/i18n/routing";
import GestoriaNav from "./GestoriaNav";
import GestoriaFooter from "./GestoriaFooter";
import GestoriaFaq from "./GestoriaFaq";
import GestoriaCookieNotice from "./GestoriaCookieNotice";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaServicePage.module.css";

/**
 * Subpágina de servicio (vitrina): PageHero + qué incluye + a quién va +
 * mini-proceso/plazos + FAQ del área + CTA + enlace al resto. Sobriedad de la
 * home, un solo toque de motion ligero (hovers): el wow vive en la home.
 */
export default function GestoriaServicePage({
  content,
  locale,
  detail,
}: {
  content: GestoriaContent;
  locale: Locale;
  detail: ServiceDetail;
}) {
  const homePath = locale === "en" ? "/en/vega-asociados" : "/vega-asociados";
  const langBase = `/vega-asociados/${detail.slug}`;
  const sp = content.servicePage;

  return (
    <div className={styles.shell} data-template="gestoria">
      <GestoriaNav content={content} locale={locale} home={false} langBase={langBase} />

      <main id="main">
        {/* PageHero */}
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <a href={homePath}>{sp.breadcrumbHome}</a>
              <span aria-hidden="true" className={styles.crumbSep}>
                /
              </span>
              <span aria-current="page">{detail.title}</span>
            </nav>
            <p className={styles.kicker}>
              <span className={styles.kickerMark} aria-hidden="true" />
              {detail.kicker}
            </p>
            <h1 className={styles.title}>{detail.title}</h1>
            <p className={styles.lead}>{detail.lead}</p>
            <div className={styles.heroCtas}>
              <a href={`${homePath}#contacto`} className={styles.ctaPrimary}>
                {content.nav.ctaLabel}
              </a>
              <a
                href={content.whatsapp.href}
                className={styles.ctaSecondary}
                target="_blank"
                rel="noopener"
              >
                <GestoriaIcon name="chat" className={styles.ctaIcon} />
                {content.nav.waLabel}
              </a>
            </div>
          </div>
        </header>

        <div className={styles.body}>
          <p className={styles.intro}>{detail.intro}</p>

          {/* Qué incluye */}
          <section className={styles.block} aria-labelledby="incluye-h">
            <h2 id="incluye-h" className={styles.blockTitle}>
              {detail.included.title}
            </h2>
            <ul className={styles.included}>
              {detail.included.items.map((item) => (
                <li key={item.name} className={styles.includedItem}>
                  <span className={styles.includedCheck} aria-hidden="true">
                    <GestoriaIcon name="check" className={styles.includedCheckIcon} />
                  </span>
                  <div>
                    <h3 className={styles.includedName}>{item.name}</h3>
                    <p className={styles.includedDesc}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* A quién va */}
          <section className={`${styles.block} ${styles.forWho}`} aria-labelledby="forwho-h">
            <div>
              <h2 id="forwho-h" className={styles.blockTitle}>
                {detail.forWho.title}
              </h2>
              <p className={styles.forWhoBody}>{detail.forWho.body}</p>
            </div>
            <ul className={styles.forWhoList}>
              {detail.forWho.items.map((it) => (
                <li key={it} className={styles.forWhoItem}>
                  <GestoriaIcon name="check" className={styles.forWhoCheck} />
                  {it}
                </li>
              ))}
            </ul>
          </section>

          {/* Mini-proceso / plazos */}
          <section className={styles.block} aria-labelledby="proceso-h">
            <h2 id="proceso-h" className={styles.blockTitle}>
              {detail.process.title}
            </h2>
            <p className={styles.processLead}>{detail.process.lead}</p>
            <ol className={styles.miniSteps}>
              {detail.process.steps.map((step, i) => (
                <li key={step.title} className={styles.miniStep}>
                  <span className={styles.miniNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className={styles.miniTitle}>{step.title}</h3>
                  <p className={styles.miniText}>{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* FAQ del área */}
          <section className={styles.block}>
            <GestoriaFaq
              variant="plain"
              title={detail.faq.title}
              items={detail.faq.items}
            />
          </section>

          {/* CTA */}
          <section className={styles.cta} aria-labelledby="cta-h">
            <h2 id="cta-h" className={styles.ctaTitle}>
              {detail.cta.title}
            </h2>
            <p className={styles.ctaBody}>{detail.cta.body}</p>
            <div className={styles.ctaActions}>
              <a href={`${homePath}#contacto`} className={styles.ctaPrimary}>
                {content.nav.ctaLabel}
              </a>
              <a href={`tel:${content.phone.tel}`} className={styles.ctaGhost}>
                <GestoriaIcon name="phone" className={styles.ctaIcon} />
                {content.phone.display}
              </a>
            </div>
          </section>

          {/* Otros servicios */}
          <section className={styles.others} aria-labelledby="others-h">
            <h2 id="others-h" className={styles.othersTitle}>
              {sp.backTitle}
            </h2>
            <p className={styles.othersLead}>{sp.backLead}</p>
            <ul className={styles.othersList}>
              {sp.others
                .filter((o) => o.href !== langBase && !o.href.endsWith(`/${detail.slug}`))
                .map((o) => (
                  <li key={o.label}>
                    {o.soon ? (
                      <span className={`${styles.otherCard} ${styles.otherSoon}`}>
                        {o.label}
                        <span className={styles.otherSoonTag}>
                          {locale === "en" ? "Soon" : "Pronto"}
                        </span>
                      </span>
                    ) : (
                      <a href={o.href} className={styles.otherCard}>
                        {o.label}
                        <span className={styles.otherArrow} aria-hidden="true">
                          →
                        </span>
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </main>

      <GestoriaFooter content={content} locale={locale} home={false} />
      <GestoriaCookieNotice strings={content.cookies} />
    </div>
  );
}
