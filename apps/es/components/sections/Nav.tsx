"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import LogoMark from "@/components/LogoMark";
import styles from "./Nav.module.css";

// Top zone: links a páginas (siempre visibles, en cualquier ruta).
const TOP_LINKS = [
  { href: "/blog/", key: "blog" },
  { href: "/faq/", key: "faq" },
] as const;

// Sub-nav zone: anclas a secciones de la home. Solo se renderiza en /.
const ANCHOR_LINKS = [
  { id: "servicios", key: "services" },
  { id: "sobre-mi", key: "about" },
  { id: "capacidades", key: "capabilities" },
  { id: "proceso", key: "process" },
  { id: "ejemplos", key: "examples" },
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
    <div ref={ref} className={styles.langSwitchWrapper}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        disabled={isPending}
        className={styles.langButton}
      >
        <GlobeIcon />
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div
          role="menu"
          className={`${styles.langDropdown} ${align === "right" ? styles.langDropdownRight : styles.langDropdownLeft}`}
        >
          {(["es", "en"] as const).map((code) => {
            const active = code === locale;
            return (
              <button
                key={code}
                role="menuitem"
                onClick={() => pick(code)}
                className={`${styles.langOption}${active ? ` ${styles.langOptionActive}` : ""}`}
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
  return (
    <a href={href} onClick={onClick} className={styles.navLink}>
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
    <nav className={styles.nav}>
      {/* === ZONA TOP: navegación de sitio (siempre visible) === */}
      <div className={styles.topBar}>
        <div className={styles.inner}>
          <a href={anchor("inicio")} className={styles.logoLink} aria-label="eBecerra">
            <LogoMark variant="negative" height={32} />
            <span className={styles.logoDomain}>ebecerra.es</span>
          </a>

          {/* Desktop */}
          <div className={styles.desktopNav}>
            {TOP_LINKS.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {t(item.key)}
              </NavLink>
            ))}
            <span className={styles.langWrapper}>
              <LangSwitch align="right" />
            </span>
            <a href={anchor("contacto")} className={styles.ctaButton}>
              → {t("ctaTalk")}
            </a>
          </div>

          {/* Mobile */}
          <div className={styles.mobileNav}>
            <LangSwitch align="right" />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("menuClose") : t("menuOpen")}
              aria-expanded={open}
              className={styles.menuButton}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </div>

      {/* === ZONA SUB-NAV: anclas a secciones (solo en home) === */}
      {isHome && (
        <div className={styles.subNav}>
          <div className={styles.inner}>
            <ul className={styles.subNavList}>
              {ANCHOR_LINKS.map((item) => (
                <li key={item.id}>
                  <a href={anchor(item.id)} className={styles.subNavLink}>
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* === Mobile drawer === */}
      {open && (
        <div className={styles.mobileDrawer}>
          {TOP_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={styles.mobileLink}
            >
              {t(item.key)}
            </a>
          ))}

          {isHome && (
            <>
              <div className={styles.mobileGroupLabel}>{t("homeSections")}</div>
              {ANCHOR_LINKS.map((item) => (
                <a
                  key={item.id}
                  href={anchor(item.id)}
                  onClick={() => setOpen(false)}
                  className={styles.mobileSubLink}
                >
                  {t(item.key)}
                </a>
              ))}
            </>
          )}

          <a
            href={anchor("contacto")}
            onClick={() => setOpen(false)}
            className={styles.mobileCta}
          >
            → {t("ctaTalk")}
          </a>
        </div>
      )}
    </nav>
  );
}
