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

// Iconos de marca (un solo color vía currentColor) para el footer.
const SOCIAL_ICONS: Record<string, string> = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  email:
    "M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67ZM22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z",
};

function socialPlatform(name: string, url: string): string | null {
  const hay = `${url} ${name}`.toLowerCase();
  if (hay.includes("instagram")) return "instagram";
  if (hay.includes("facebook") || hay.includes("fb.com")) return "facebook";
  if (hay.includes("linkedin")) return "linkedin";
  return null;
}

function SocialIcon({ platform }: { platform: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={SOCIAL_ICONS[platform]} />
    </svg>
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
            <ul className={styles.socialList}>
              {footer.socialLinks.map((s) => {
                const platform = socialPlatform(s.name, s.url);
                return (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target={s.external ? "_blank" : undefined}
                      rel={s.external ? "noopener noreferrer" : undefined}
                      className={styles.socialItem}
                    >
                      {platform && <SocialIcon platform={platform} />}
                      <span>{s.name}</span>
                    </a>
                  </li>
                );
              })}
              {footer.email && (
                <li>
                  <a
                    href={`mailto:${footer.email}`}
                    className={styles.socialItem}
                  >
                    <SocialIcon platform="email" />
                    <span>Email</span>
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
          <span className={styles.copyright}>{copyright}</span>
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
