"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./FisioNavMobile.module.css";

type Item = { href: string; label: string };

type Props = {
  brand: ReactNode;
  items: Item[];
  ctaLabel: string;
  ctaHref?: string;
  ariaOpen: string;
  ariaClose: string;
  ariaPrimaryNav: string;
  /**
   * Scope CSS de la plantilla que renderiza el drawer. El drawer se
   * monta en document.body via createPortal, fuera del shell con
   * data-template, así que necesita su propio data-template para
   * heredar los tokens correctos (paleta, tipografía).
   */
  templateScope?: string;
  /** Acción secundaria opcional en el footer del drawer (ej. WhatsApp). */
  secondaryHref?: string;
  secondaryLabel?: string;
};

export default function FisioNavMobile({
  brand,
  items,
  ctaLabel,
  ctaHref = "#contacto",
  ariaOpen,
  ariaClose,
  ariaPrimaryNav,
  templateScope = "fisio",
  secondaryHref,
  secondaryLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  // Mount detection for portal — solo despues de hidratar evitamos
  // mismatches React #418 entre SSR y cliente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // a11y: al abrir, llevar el foco DENTRO del drawer y ATRAPAR el Tab (que no se
  // escape a la página de detrás); al cerrar, DEVOLVER el foco al botón hamburguesa.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusables = () =>
      Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
        ),
      );
    (focusables()[0] ?? drawer).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    drawer.addEventListener("keydown", onKey);
    return () => {
      drawer.removeEventListener("keydown", onKey);
      toggleRef.current?.focus(); // foco de vuelta al toggle al cerrar
    };
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const drawer = (
    <div data-template={templateScope} className={styles.portalRoot}>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        ref={drawerRef}
        id="fisio-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={ariaPrimaryNav}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
        inert={!open || undefined}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerBrand}>{brand}</span>
          <button
            type="button"
            className={styles.close}
            onClick={() => setOpen(false)}
            aria-label={ariaClose}
          >
            ✕
          </button>
        </div>

        <nav aria-label={ariaPrimaryNav}>
          <ul className={styles.menu}>
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={styles.link}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.footer}>
          <a
            href={ctaHref}
            className={styles.cta}
            onClick={() => setOpen(false)}
          >
            {ctaLabel}
          </a>
          {secondaryHref && secondaryLabel && (
            <a
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondaryCta}
              onClick={() => setOpen(false)}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={`${styles.toggle} ${open ? styles.open : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="fisio-mobile-drawer"
        aria-label={open ? ariaClose : ariaOpen}
      >
        <span className={styles.bars} aria-hidden="true">
          <span className={`${styles.bar} ${styles.barTop}`} />
          <span className={`${styles.bar} ${styles.barMid}`} />
          <span className={`${styles.bar} ${styles.barBot}`} />
        </span>
      </button>
      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
