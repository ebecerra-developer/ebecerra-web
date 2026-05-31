"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteSettingsNavItem } from "@ebecerra/sanity-client";
import LogoMark from "@/components/LogoMark";
import styles from "./Nav.module.css";

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

type Props = {
  items: SiteSettingsNavItem[];
  ctaLabel: string;
};

export default function NavClient({ items, ctaLabel }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  const isHome = pathname === "/";
  const anchor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  // Items separados: top muestra páginas, sub-nav muestra anchors (solo home).
  const pageItems = items.filter(
    (it): it is Extract<SiteSettingsNavItem, { type: "page" }> =>
      it.type === "page"
  );
  const anchorItems = items.filter(
    (it): it is Extract<SiteSettingsNavItem, { type: "anchor" }> =>
      it.type === "anchor"
  );
  // El último anchor (Contacto) se usa como CTA principal.
  const contactAnchor = anchorItems.find((a) => a.key === "contacto");

  useEffect(() => {
    if (!isHome || anchorItems.length === 0) return;
    const ids = anchorItems.map((l) => l.key);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visibleIds = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) visibleIds.add(id);
          else visibleIds.delete(id);
        }
        if (visibleIds.size === 0) {
          setActiveAnchor(null);
          return;
        }
        const topmost = Array.from(visibleIds)
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => !!el)
          .sort((a, b) => a.offsetTop - b.offsetTop)[0];
        if (topmost) setActiveAnchor(topmost.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  return (
    <nav className={styles.nav}>
      <div className={styles.topBar}>
        <div className={styles.inner}>
          <a href={anchor("inicio")} className={styles.logoLink} aria-label="eBecerra">
            <LogoMark variant="negative" height={32} />
            <span className={styles.logoDomain}>ebecerra.es</span>
          </a>

          <div className={styles.desktopNav}>
            {pageItems.map((item) => (
              <a key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            ))}
            <span className={styles.langWrapper}>
              <LangSwitch align="right" />
            </span>
            {contactAnchor && (
              <a
                href={anchor(contactAnchor.key)}
                className={`${styles.ctaButton} fx-ripple`}
              >
                → {ctaLabel}
              </a>
            )}
          </div>

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

      {isHome && anchorItems.length > 0 && (
        <div className={styles.subNav}>
          <div className={styles.inner}>
            <ul className={styles.subNavList}>
              {anchorItems.map((item) => (
                <li key={item.key}>
                  <a
                    href={anchor(item.key)}
                    className={styles.subNavLink}
                    data-active={activeAnchor === item.key}
                    aria-current={activeAnchor === item.key ? "true" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {open && (
        <div className={styles.mobileDrawer}>
          {pageItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={styles.mobileLink}
            >
              {item.label}
            </a>
          ))}

          {anchorItems.length > 0 && (
            <>
              <div className={styles.mobileGroupLabel}>{t("homeSections")}</div>
              {anchorItems.map((item) => (
                <a
                  key={item.key}
                  href={anchor(item.key)}
                  onClick={() => setOpen(false)}
                  className={styles.mobileSubLink}
                >
                  {item.label}
                </a>
              ))}
            </>
          )}

          {contactAnchor && (
            <a
              href={anchor(contactAnchor.key)}
              onClick={() => setOpen(false)}
              className={`${styles.mobileCta} fx-ripple`}
            >
              → {ctaLabel}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
