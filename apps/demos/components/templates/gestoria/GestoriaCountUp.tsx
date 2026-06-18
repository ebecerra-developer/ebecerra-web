"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./GestoriaCountUp.module.css";

/**
 * Contador con count-up al entrar en viewport (IntersectionObserver, barato) y,
 * si emphasis, un subrayado "a mano" que se dibuja al terminar el conteo
 * (stroke-dashoffset, sin dependencias — rough-notation no está en apps/demos).
 * El número es serio; la animación solo dirige la mirada. Respeta
 * prefers-reduced-motion: muestra el valor final y el trazo ya dibujado.
 */
const DURATION = 1400;

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function GestoriaCountUp({
  value,
  prefix = "",
  suffix = "",
  emphasis = false,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  emphasis?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrawn(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();

        let raf = 0;
        let start = 0;
        const tick = (now: number) => {
          if (!start) start = now;
          const p = Math.min(1, (now - start) / DURATION);
          setDisplay(Math.round(easeOut(p) * value));
          if (p < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            setDrawn(true);
          }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={styles.wrap}>
      <span className={styles.value}>
        {prefix}
        {display.toLocaleString("es-ES")}
        {suffix}
      </span>
      {emphasis && (
        <svg
          className={`${styles.underline} ${drawn ? styles.drawn : ""}`}
          viewBox="0 0 120 12"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M3 7.5C24 4 48 9.5 70 6.5c18-2.4 34 1 47-1.5" />
        </svg>
      )}
    </span>
  );
}
