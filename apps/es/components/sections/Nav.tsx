"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import LogoMark from "@/components/LogoMark";
import styles from "./Nav.module.css";

// Nav top-level items. Tipo discrimina anchor (sección de home) vs page (ruta).
// La nav top se mantiene corta — el footer tiene la lista completa.
type NavItem =
  | { type: "anchor"; id: string; key: string }
  | { type: "page"; href: string; key: string };

const NAV_ITEMS: readonly NavItem[] = [
  { type: "anchor", id: "servicios", key: "services" },
  { type: "anchor", id: "ejemplos", key: "examples" },
  { type: "page", href: "/blog/", key: "blog" },
  { type: "anchor", id: "contacto", key: "contact" },
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
  const itemHref = (item: NavItem) =>
    item.type === "anchor" ? anchor(item.id) : item.href;
  const itemKey = (item: NavItem) =>
    item.type === "anchor" ? item.id : item.href;

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <a href={anchor("inicio")} className={styles.logoLink} aria-label="eBecerra">
          <LogoMark variant="negative" height={32} />
          <span className={styles.logoDomain}>ebecerra.es</span>
        </a>

        {/* Desktop */}
        <div className={styles.desktopNav}>
          {NAV_ITEMS.map((item) => (
            <NavLink key={itemKey(item)} href={itemHref(item)}>
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

      {open && (
        <div className={styles.mobileDrawer}>
          {NAV_ITEMS.map((item) => (
            <a
              key={itemKey(item)}
              href={itemHref(item)}
              onClick={() => setOpen(false)}
              className={styles.mobileLink}
            >
              {t(item.key)}
            </a>
          ))}
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
