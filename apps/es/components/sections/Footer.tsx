"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LogoMark from "@/components/LogoMark";
import type { SiteSettingsFooter } from "@ebecerra/sanity-client";
import styles from "./Footer.module.css";

const NAV_COL = [
  { id: "servicios", key: "services" },
  { id: "sobre-mi", key: "about" },
  { id: "capacidades", key: "capabilities" },
  { id: "proceso", key: "process" },
  { id: "ejemplos", key: "examples" },
  { id: "contacto", key: "contact" },
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
              {NAV_COL.map((item) => (
                <li key={item.id}>
                  <FooterLink href={anchor(item.id)}>{tn(item.key)}</FooterLink>
                </li>
              ))}
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
