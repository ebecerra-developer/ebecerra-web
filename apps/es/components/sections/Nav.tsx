"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import LogoMark from "@/components/LogoMark";

const NAV_ITEMS = [
  { id: "servicios", key: "services" },
  { id: "casos", key: "cases" },
  { id: "sobre-mi", key: "about" },
  { id: "proceso", key: "process" },
  { id: "contacto", key: "contact" },
] as const;

function GlobeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--cta)"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MenuIcon({ open, size = 24 }: { open: boolean; size?: number }) {
  return open ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function LangSwitch({ align = "right" }: { align?: "left" | "right" }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => router.replace(pathname, { locale: next }));
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        disabled={isPending}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "6px 8px",
          borderRadius: 6,
          color: "#fafaf9",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        <GlobeIcon />
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            [align]: 0,
            minWidth: 160,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            boxShadow: "var(--sh-3)",
            padding: 4,
            zIndex: 60,
          }}
        >
          {(["es", "en"] as const).map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                role="menuitem"
                onClick={() => pick(code)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 10px",
                  borderRadius: 5,
                  background: active ? "var(--surface-subtle)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: "var(--text)",
                }}
              >
                <span>{t(code === "es" ? "langEs" : "langEn")}</span>
                {active && <CheckIcon />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 500,
        color: hover ? "#fafaf9" : "rgba(250,250,249,0.82)",
        background: hover ? "rgba(255,255,255,0.08)" : "transparent",
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: 6,
        transition: "color 150ms var(--ease), background 150ms var(--ease)",
      }}
    >
      {children}
    </a>
  );
}

export default function Nav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--cta)",
        borderBottom: "1px solid var(--cta-hover)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 56px)",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <a
          href={anchor("inicio")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
          aria-label="eBecerra"
        >
          <LogoMark variant="negative" height={32} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 400,
              color: "rgba(250,250,249,0.75)",
              letterSpacing: "0.04em",
            }}
          >
            ebecerra.es
          </span>
        </a>

        {/* Desktop */}
        <div className="nav-desktop" style={{ alignItems: "center", gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.id} href={anchor(item.id)}>
              {t(item.key)}
            </NavLink>
          ))}
          <span style={{ marginLeft: 8 }}>
            <LangSwitch align="right" />
          </span>
          <a
            href={anchor("contacto")}
            style={{
              marginLeft: 12,
              background: "#fafaf9",
              color: "var(--cta)",
              fontFamily: "var(--font-sans)",
              fontSize: 13.5,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 6,
              textDecoration: "none",
              border: "1.5px solid #fafaf9",
              transition: "background 150ms var(--ease), transform 150ms var(--ease)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            → {t("ctaTalk")}
          </a>
        </div>

        {/* Mobile */}
        <div className="nav-mobile" style={{ alignItems: "center", gap: 4 }}>
          <LangSwitch align="right" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("menuClose") : t("menuOpen")}
            aria-expanded={open}
            style={{
              background: "transparent",
              border: "none",
              padding: 6,
              cursor: "pointer",
              color: "#fafaf9",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuIcon open={open} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="nav-mobile"
          style={{
            flexDirection: "column",
            background: "var(--cta)",
            borderTop: "1px solid var(--cta-hover)",
            padding: "12px 20px 20px",
            gap: 4,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={anchor(item.id)}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                fontWeight: 500,
                color: "#fafaf9",
                textDecoration: "none",
                padding: "10px 4px",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              {t(item.key)}
            </a>
          ))}
          <a
            href={anchor("contacto")}
            onClick={() => setOpen(false)}
            style={{
              marginTop: 12,
              background: "#fafaf9",
              color: "var(--cta)",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 600,
              padding: "12px 16px",
              borderRadius: 6,
              textAlign: "center",
              textDecoration: "none",
              border: "1.5px solid #fafaf9",
            }}
          >
            → {t("ctaTalk")}
          </a>
        </div>
      )}

      <style>{`
        .nav-desktop { display: none; }
        .nav-mobile { display: flex; }
        @media (min-width: 900px) {
          .nav-desktop { display: flex; }
          .nav-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
