"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import styles from "./StackScroll.module.css";

type Props = { children: ReactNode };

// Secciones que se apilan al hacer scroll: la actual queda fija arriba y se aleja
// (encoge + se atenúa) mientras la siguiente sube desde abajo y la tapa. Las
// secciones más altas que la pantalla se scrollean con normalidad hasta que su
// borde inferior llega abajo; entonces se fijan y dejan paso a la siguiente.
// Se desactiva con prefers-reduced-motion (scroll normal, sin apilado).
export default function StackScroll({ children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return; // flujo normal, sin apilado

    const items = Array.from(
      root.querySelectorAll<HTMLElement>(`:scope > .${styles.item}`),
    );
    if (items.length < 2) return;

    // top del sticky por sección: 0 si cabe en pantalla, negativo (vh - alto) si
    // es más alta → se scrollea hasta su fondo y luego se fija. z-index creciente
    // para que cada sección tape a la anterior.
    function layout() {
      const vh = window.innerHeight;
      items.forEach((el, i) => {
        const h = el.offsetHeight;
        el.style.top = `${Math.min(0, vh - h)}px`;
        el.style.zIndex = String(i + 1);
      });
    }

    // --p (0→1): cuánto ha subido la siguiente sección sobre la actual.
    function update() {
      const vh = window.innerHeight;
      for (let i = 0; i < items.length - 1; i++) {
        const top = items[i + 1].getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, 1 - top / vh));
        items[i].style.setProperty("--p", p.toFixed(4));
      }
      items[items.length - 1].style.setProperty("--p", "0");
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }

    layout();
    update();

    const ro = new ResizeObserver(() => {
      layout();
      update();
    });
    items.forEach((el) => ro.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", layout);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.stack}>
      {/* toArray + filtro de elementos válidos: descarta hijos null/false (p.ej.
          una sección condicional como Reseñas cuando no hay datos) para no crear
          un panel vacío que rompería el cálculo de recede del apilado. */}
      {Children.toArray(children)
        .filter((child) => isValidElement(child))
        .map((child, i) => (
          <div key={i} className={styles.item}>
            {child}
          </div>
        ))}
    </div>
  );
}
