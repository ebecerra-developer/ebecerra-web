import Link from "next/link";
import type { ProductCategory } from "./commerce";
import type { TiendaContent } from "./content";
import { routes } from "./routes";
import Icon from "./Icon";
import styles from "./TiendaFooter.module.css";

export default function TiendaFooter({
  content,
  categories,
}: {
  content: TiendaContent;
  categories: ProductCategory[];
}) {
  const { brand, footer, phone, whatsapp, email, freeShippingCopy } = content;
  const year = 2026;

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.topInner}>
          <div className={styles.brandCol}>
            <span className={styles.brand}>
              <span className={styles.markChip} aria-hidden="true">
                <img
                  src={brand.logoUrl}
                  alt=""
                  className={styles.markImg}
                  width={34}
                  height={34}
                />
              </span>
              {brand.name}
            </span>
            <p className={styles.tagline}>{footer.tagline}</p>
            <div className={styles.contact}>
              <a href={`tel:${phone.tel}`} className={styles.contactLink}>
                <Icon name="phone" size={17} strokeWidth={1.7} />
                {phone.display}
              </a>
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactLink}
              >
                <Icon name="phone" size={17} strokeWidth={1.7} />
                {whatsapp.display}
              </a>
              <span className={styles.contactMeta}>{email}</span>
              <span className={styles.contactMeta}>
                <Icon name="clock" size={16} strokeWidth={1.6} />
                {footer.hours}
              </span>
            </div>
          </div>

          <nav className={styles.col} aria-label={footer.columns.shop}>
            <h3 className={styles.colTitle}>{footer.columns.shop}</h3>
            <ul>
              {categories.map((c) => (
                <li key={c.handle}>
                  <Link href={routes.category(c.handle)}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link href={routes.offers()} className={styles.offer}>
                  {content.nav.offersLabel}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col} aria-label={footer.columns.help}>
            <h3 className={styles.colTitle}>{footer.columns.help}</h3>
            <ul>
              {footer.helpLinks.map((l) => (
                <li key={l}>
                  <span className={styles.staticLink}>{l}</span>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label={footer.columns.company}>
            <h3 className={styles.colTitle}>{footer.columns.company}</h3>
            <ul>
              {footer.companyLinks.map((l) => (
                <li key={l}>
                  <span className={styles.staticLink}>{l}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className={styles.strip}>
        <span className={styles.stripItem}>
          <Icon name="truck" size={18} strokeWidth={1.7} />
          {freeShippingCopy}
        </span>
        <span className={styles.stripItem}>
          <Icon name="card" size={18} strokeWidth={1.7} />
          Paga al recibir
        </span>
        <span className={styles.stripItem}>
          <Icon name="shield" size={18} strokeWidth={1.7} />
          Compra segura
        </span>
      </div>

      <div className={styles.bottom}>
        <ul className={styles.legal}>
          {footer.legalLinks.map((l) => (
            <li key={l}>
              <span className={styles.legalLink}>{l}</span>
            </li>
          ))}
        </ul>
        <p className={styles.disclaimer}>{footer.demoDisclaimer}</p>
        <p className={styles.rights}>
          © {year} {footer.rights}
        </p>
      </div>
    </footer>
  );
}
