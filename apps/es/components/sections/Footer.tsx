"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LogoMark from "@/components/LogoMark";
import type { SiteSettingsFooter } from "@ebecerra/sanity-client";
import styles from "./Footer.module.css";

const NAV_COL = [
  { id: "servicios", key: "services" },
  { id: "sobre-mi", key: "about" },
  { id: "proceso", key: "process" },
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
  footerData?: Pick<SiteSettingsFooter, "tagline" | "availability"> | null;
};

export default function Footer({ footerData }: Props) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const year = new Date().getFullYear();

  const tagline = footerData?.tagline ?? t("tagline");
  const availability = footerData?.availability ?? t("availability");

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
              <li>
                <FooterLink href="/ejemplos">{t("colNavExamples")}</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <ColTitle>{t("colSocialTitle")}</ColTitle>
            <ul className={styles.linkList}>
              <li>
                <FooterLink
                  href="https://www.linkedin.com/in/enrique-becerra-garcia/"
                  external
                >
                  LinkedIn ↗
                </FooterLink>
              </li>
              <li>
                <FooterLink href="mailto:contacto@ebecerra.es">Email</FooterLink>
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
