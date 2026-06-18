"use client";

import { useEffect, useRef, useState } from "react";
import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaProcess.module.css";

/**
 * WOW #1 — "Tu gestión en 3 pasos". Cada paso se ENCIENDE (check verde) cuando
 * entra en el viewport y se queda encendido (IntersectionObserver, no mapeo por
 * frame → nada de tirones). El trazo verde se RELLENA por niveles con una
 * transición suave conforme avanzan los pasos. La línea se mide para ir
 * exactamente del primer al último marcador (sin sobresalir). Vertical para que
 * rinda igual en móvil. reduced-motion → trazo completo y los 3 activos.
 */
export default function GestoriaProcess({ content }: { content: GestoriaContent }) {
  const p = content.process;
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<boolean[]>(
    p.steps.map(() => false)
  );

  // Geometría de la línea: del centro del primer marcador al del último.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const measure = () => {
      const markers = el.querySelectorAll<HTMLElement>("[data-marker]");
      if (markers.length < 2) return;
      const trackTop = el.getBoundingClientRect().top;
      const first = markers[0].getBoundingClientRect();
      const last = markers[markers.length - 1].getBoundingClientRect();
      const top = first.top - trackTop + first.height / 2;
      const bottom = last.top - trackTop + last.height / 2;
      el.style.setProperty("--line-top", `${top}px`);
      el.style.setProperty("--line-h", `${Math.max(0, bottom - top)}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Encendido por paso al entrar en viewport (se queda encendido).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(p.steps.map(() => true));
      return;
    }

    const items = el.querySelectorAll<HTMLElement>("[data-step]");
    const io = new IntersectionObserver(
      (entries) => {
        // forma funcional: evita leer un `active` obsoleto del closure
        setActive((prev) => {
          let changed = false;
          const next = prev.slice();
          for (const e of entries) {
            if (e.isIntersecting) {
              const i = Number((e.target as HTMLElement).dataset.step);
              if (!next[i]) {
                next[i] = true;
                changed = true;
              }
            }
          }
          return changed ? next : prev;
        });
      },
      // se dispara cuando el paso cruza ~55% de la altura del viewport
      { rootMargin: "0px 0px -45% 0px", threshold: 0 }
    );
    items.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Relleno del trazo según pasos encendidos (transición suave en CSS).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const count = active.filter(Boolean).length;
    const progress = count / active.length;
    el.style.setProperty("--p", progress.toFixed(3));
  }, [active]);

  return (
    <section id="proceso" className={styles.section} aria-labelledby="process-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {p.kicker}
          </p>
          <h2 id="process-heading" className={styles.title}>
            {p.title}
          </h2>
          <p className={styles.lead}>{p.lead}</p>
        </header>

        <div className={styles.track} ref={trackRef}>
          <svg className={styles.line} viewBox="0 0 4 100" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.lineBg} d="M2 1 V99" pathLength={1} />
            <path className={styles.lineFg} d="M2 1 V99" pathLength={1} />
          </svg>

          <ol className={styles.steps}>
            {p.steps.map((step, i) => (
              <li
                key={step.title}
                data-step={i}
                className={`${styles.step} ${active[i] ? styles.stepOn : ""}`}
              >
                <span className={styles.marker} data-marker aria-hidden="true">
                  <span className={styles.markerNum}>{i + 1}</span>
                  <GestoriaIcon name="check" className={styles.markerCheck} />
                </span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className={styles.footnote}>
          <GestoriaIcon name="phone" className={styles.footIcon} />
          {p.footnote}
        </p>
      </div>
    </section>
  );
}
