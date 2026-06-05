"use client";

import { useRef } from "react";
import styles from "./ExpedicionFooter.module.css";

/**
 * Botón "volver arriba" que rebobina el camino: en vez de saltar, anima el scroll
 * de vuelta al inicio despacio, así el metraje POV se ve retroceder hasta el hero.
 * Respeta prefers-reduced-motion (salto directo).
 */
export default function ExpedicionBackToTop({ label }: { label: string }) {
  const animRef = useRef(0);

  function onClick() {
    const startY = window.scrollY;
    if (startY < 8) return;
    cancelAnimationFrame(animRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }
    const dur = Math.min(2400, Math.max(900, (startY / window.innerHeight) * 700));
    const t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, startY * (1 - ease(t)));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  }

  return (
    <button type="button" className={styles.toTop} onClick={onClick}>
      <span className={styles.toTopRing} aria-hidden="true">
        <span className={styles.toTopArrow} />
      </span>
      <span className={styles.toTopLabel}>{label}</span>
    </button>
  );
}
