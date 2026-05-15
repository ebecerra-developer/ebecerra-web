"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LogoMark from "@/components/LogoMark";
import type { SiteSettingsFooter } from "@ebecerra/sanity-client";
import styles from "./Footer.module.css";

type FooterNavItem =
  | { type: "anchor"; id: string; key: string }
  | { type: "page"; href: string; key: string };

const NAV_COL: readonly FooterNavItem[] = [
  { type: "anchor", id: "servicios", key: "services" },
  { type: "anchor", id: "sobre-mi", key: "about" },
  { type: "anchor", id: "capacidades", key: "capabilities" },
  { type: "anchor", id: "proceso", key: "process" },
  { type: "anchor", id: "ejemplos", key: "examples" },
  { type: "page", href: "/blog/", key: "blog" },
  { type: "anchor", id: "contacto", key: "contact" },
] as const;

function ColTitle({ children }: { children: React.ReactNode }) {
  return <div className={styles.colTitle}>{"// "}{children}</div>;
}

function FooterLink({
  href,
  children,
  accent = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={accent ? styles.linkAccent : styles.link}
    >
      {children}
    </a>
  );
}

type Props = {
  footerData?: Pick<
    SiteSettingsFooter,
    "tagline" | "availability" | "email" | "socialLinks"
  > | null;
};

// Fallback si Sanity está vacío — mantiene el comportamiento anterior.
const FALLBACK_SOCIAL: SiteSettingsFooter["socialLinks"] = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/enrique-becerra-garcia/",
    external: true,
  },
];
const FALLBACK_EMAIL = "contacto@ebecerra.es";

export default function Footer({ footerData }: Props) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const year = new Date().getFullYear();

  const tagline = footerData?.tagline ?? t("tagline");
  const availability = footerData?.availability ?? t("availability");
  const email = footerData?.email ?? FALLBACK_EMAIL;
  const socialLinks =
    footerData?.socialLinks && footerData.socialLinks.length > 0
      ? footerData.socialLinks
      : FALLBACK_SOCIAL;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <div className={styles.logoWrapper}>
              <LogoMark variant="negative" height={32} />
            </div>
            <p className={styles.tagline}>{tagline}</p>
            <div className={styles.availabilityRow}>
              <span className={styles.availabilityDot} />
              {availability}
            </div>
          </div>

          <div>
            <ColTitle>{t("colNavTitle")}</ColTitle>
            <ul className={styles.linkList}>
              {NAV_COL.map((item) => {
                const href = item.type === "anchor" ? anchor(item.id) : item.href;
                const k = item.type === "anchor" ? item.id : item.href;
                return (
                  <li key={k}>
                    <FooterLink href={href}>{tn(item.key)}</FooterLink>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <ColTitle>{t("colSocialTitle")}</ColTitle>
            <ul className={styles.linkList}>
              {socialLinks.map((s) => (
                <li key={s.url}>
                  <FooterLink href={s.url} external={s.external}>
                    {s.name} ↗
                  </FooterLink>
                </li>
              ))}
              <li>
                <FooterLink href={`mailto:${email}`}>✉ Email</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <ColTitle>{t("colCrossTitle")}</ColTitle>
            <ul className={styles.linkList}>
              <li>
                <FooterLink href="https://ebecerra.tech" accent external>
                  {t("ebecerraTech")}
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/piezas-game/" accent external>
                  {t("piezasGame")}
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>{t("copyright", { year })}</span>
          <div className={styles.legalLinks}>
            <Link href="/faq" className={styles.legalLink}>
              {t("legalFaq")}
            </Link>
            <Link href="/privacidad" className={styles.legalLink}>
              {t("legalPrivacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
