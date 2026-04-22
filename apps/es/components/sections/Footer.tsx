"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import LogoMark from "@/components/LogoMark";

const NAV_COL = [
  { id: "servicios", key: "services" },
  { id: "casos", key: "cases" },
  { id: "sobre-mi", key: "about" },
  { id: "proceso", key: "process" },
  { id: "contacto", key: "contact" },
] as const;

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "#57534e",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 16,
        fontWeight: 500,
      }}
    >
      // {children}
    </div>
  );
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
      className={accent ? "footer-link footer-link--accent" : "footer-link"}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: accent ? "#34d399" : "#d6d3d1",
        textDecoration: "none",
        transition: "color 150ms var(--ease)",
      }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "#a8a29e",
        padding: "64px clamp(20px, 4vw, 56px) 40px",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="footer-grid">
          <div>
            <div style={{ marginBottom: 16 }}>
              <LogoMark variant="negative" height={32} />
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                margin: "0 0 16px",
                color: "#a8a29e",
                maxWidth: 320,
              }}
            >
              {t("tagline")}
            </p>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "#78716c",
                letterSpacing: "0.04em",
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              {t("availability")}
            </div>
          </div>

          <div>
            <ColTitle>{t("colNavTitle")}</ColTitle>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {NAV_COL.map((item) => (
                <li key={item.id}>
                  <FooterLink href={anchor(item.id)}>{tn(item.key)}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>{t("colSocialTitle")}</ColTitle>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <li>
                <FooterLink
                  href="https://www.linkedin.com/in/enrique-becerra-garcia/"
                  external
                >
                  LinkedIn ↗
                </FooterLink>
              </li>
              <li>
                <FooterLink href="mailto:contacto@ebecerra.es">
                  Email
                </FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <ColTitle>{t("colCrossTitle")}</ColTitle>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <li>
                <FooterLink
                  href="https://ebecerra.tech"
                  accent
                  external
                >
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

        <div
          style={{
            marginTop: 40,
            paddingTop: 28,
            borderTop: "1px solid #292524",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 11.5,
            color: "#78716c",
            letterSpacing: "0.04em",
          }}
          className="footer-bottom"
        >
          <span>{t("copyright", { year })}</span>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <a
              href="/privacidad"
              style={{ color: "#78716c", textDecoration: "none" }}
              className="footer-link"
            >
              {t("legalPrivacy")}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          padding-bottom: 40px;
          border-bottom: 1px solid #292524;
        }
        .footer-link:hover { color: #fafaf9 !important; }
        .footer-link--accent:hover { color: #6ee7b7 !important; }
        @media (min-width: 900px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 48px;
          }
          .footer-bottom {
            flex-direction: row !important;
            justify-content: space-between;
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
}
