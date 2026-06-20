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

  // Scroll a ancla en la home: el scroll nativo falla con el apilado (StackScroll)
  // porque las secciones son sticky y se quedan pinchadas arriba (rect.top ~0), así
  // que al subir el navegador cree que ya están arriba y se queda corto. Calculamos
  // la posición de FLUJO real con offsetTop (inmune al sticky) y vamos ahí.
  const scrollToAnchor = (
    e: React.MouseEvent<HTMLAnchorElement>,
    key: string
  ) => {
    if (!isHome) return; // entre páginas, deja que navegue a /#key
    const el = document.getElementById(key);
    if (!el) return;
    e.preventDefault();
    let y = 0;
    let node: HTMLElement | null = el;
    while (node) {
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    const navOffset = window.matchMedia("(min-width: 900px)").matches ? 136 : 80;
    window.scrollTo({ top: Math.max(0, y - navOffset), behavior: "smooth" });
    if (typeof history.replaceState === "function") {
      history.replaceState(null, "", `#${key}`);
    }
  };

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

  // Scroll-spy robusto al apilado (StackScroll): las secciones son sticky y se
  // solapan, así que no vale ordenar por offsetTop (es 0 para todas dentro del
  // .item). Elegimos la sección FRONTAL: la última en orden de documento cuya
  // caja real cubre una línea de referencia del viewport (la que el apilado pone
  // delante). Orden del array = orden de documento = orden de z-index.
  useEffect(() => {
    if (!isHome || anchorItems.length === 0) return;
    const ids = anchorItems.map((l) => l.key);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let raf = 0;
    const compute = () => {
      const refY = window.innerHeight * 0.4;
      let active: string | null = null;
      sections.forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.top <= refY && r.bottom > refY) active = sec.id; // última que cubre
      });
      setActiveAnchor(active);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  // Corrección de scroll a ancla al llegar con hash: las secciones dinámicas
  // (ExamplesStage fija su alto tras el primer paint) desplazan el destino, así
  // que el scroll inicial se queda corto. Re-scrolleamos tras asentarse.
  useEffect(() => {
    if (!isHome) return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const id = decodeURIComponent(hash.slice(1));
    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView();
    };
    const r1 = requestAnimationFrame(() => requestAnimationFrame(doScroll));
    const t1 = window.setTimeout(doScroll, 250);
    const t2 = window.setTimeout(doScroll, 600);
    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  return (
    <nav className={styles.nav}>
      <div className={styles.topBar}>
        <div className={styles.inner}>
          <a
            href={anchor("inicio")}
            onClick={(e) => scrollToAnchor(e, "inicio")}
            className={styles.logoLink}
            aria-label="eBecerra"
          >
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
                onClick={(e) => scrollToAnchor(e, contactAnchor.key)}
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
                    onClick={(e) => scrollToAnchor(e, item.key)}
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
                  onClick={(e) => {
                    setOpen(false);
                    scrollToAnchor(e, item.key);
                  }}
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
              onClick={(e) => {
                setOpen(false);
                scrollToAnchor(e, contactAnchor.key);
              }}
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
