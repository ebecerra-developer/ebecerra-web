"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./FisioNavMobile.module.css";

type Item = { href: string; label: string };

type Props = {
  brand: string;
  items: Item[];
  ctaLabel: string;
  ctaHref?: string;
  ariaOpen: string;
  ariaClose: string;
  ariaPrimaryNav: string;
};

export default function FisioNavMobile({
  brand,
  items,
  ctaLabel,
  ctaHref = "#contacto",
  ariaOpen,
  ariaClose,
  ariaPrimaryNav,
}: Props) {
  const [open, setOpen] = useState(false);
  const isClient = typeof document !== "undefined";

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="fisio-mobile-drawer"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
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
        </div>
      </aside>
    </>
  );

  return (
    <>
      <button
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
      {isClient && createPortal(drawer, document.body)}
    </>
  );
}
