"use client";

import { Link, usePathname } from "@/i18n/navigation";
import type { SiteSettingsFull } from "@ebecerra/sanity-client";
import LogoMark from "@/components/LogoMark";
import styles from "./Footer.module.css";

type Props = {
  settings: SiteSettingsFull;
};

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.colTitle}>
      {"// "}
      {children}
    </div>
  );
}

export default function FooterClient({ settings }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const year = new Date().getFullYear();

  const footer = settings.footer;
  const copyright = (footer.copyrightTemplate ?? "© {year}").replace(
    "{year}",
    String(year)
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <div className={styles.logoWrapper}>
              <LogoMark variant="negative" height={32} />
            </div>
            {footer.tagline && (
              <p className={styles.tagline}>{footer.tagline}</p>
            )}
            {footer.availability && (
              <div className={styles.availabilityRow}>
                <span className={styles.availabilityDot} />
                {footer.availability}
              </div>
            )}
          </div>

          {footer.navColumn.length > 0 && (
            <div>
              <ColTitle>{footer.colNavTitle ?? ""}</ColTitle>
              <ul className={styles.linkList}>
                {footer.navColumn.map((item) => {
                  const href =
                    item.type === "anchor" ? anchor(item.key) : item.href;
                  const key =
                    item.type === "anchor" ? `a:${item.key}` : `p:${item.href}`;
                  return (
                    <li key={key}>
                      <a href={href} className={styles.link}>
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <ColTitle>{footer.colSocialTitle ?? ""}</ColTitle>
            <ul className={styles.linkList}>
              {footer.socialLinks.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target={s.external ? "_blank" : undefined}
                    rel={s.external ? "noopener noreferrer" : undefined}
                    className={styles.link}
                  >
                    {s.name} ↗
                  </a>
                </li>
              ))}
              {footer.email && (
                <li>
                  <a href={`mailto:${footer.email}`} className={styles.link}>
                    ✉ Email
                  </a>
                </li>
              )}
            </ul>
          </div>

          {footer.crossLinks.length > 0 && (
            <div>
              <ColTitle>{footer.colCrossTitle ?? ""}</ColTitle>
              <ul className={styles.linkList}>
                {footer.crossLinks.map((c) => (
                  <li key={c.href}>
                    <a
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={c.external ? "noopener noreferrer" : undefined}
                      className={styles.linkAccent}
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <span>{copyright}</span>
          {footer.legalLinks.length > 0 && (
            <div className={styles.legalLinks}>
              {footer.legalLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={styles.legalLink}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
