"use client";

import { useEffect, useRef, useState } from "react";
import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaProcess.module.css";

/**
 * WOW #1 — "Tu gestión en 3 pasos". El trazo verde es UNA sola línea continua
 * que se DIBUJA de arriba abajo con el scroll (sigue un punto de revelado a ~62%
 * del viewport). Cada paso se ENCIENDE justo cuando el trazo llega a su marcador
 * (medimos la posición exacta de cada marcador → sin huecos en blanco) y se
 * DESMARCA al subir (reversible). Al final, toda la línea queda verde.
 * reduced-motion → trazo completo y los 3 pasos activos, sin scroll.
 */
const REVEAL = 0.62; // punto de revelado: 62% de la altura del viewport

export default function GestoriaProcess({ content }: { content: GestoriaContent }) {
  const p = content.process;
  const trackRef = useRef<HTMLDivElement>(null);
  const lineTopRef = useRef(0); // offset del inicio de la línea dentro del track
  const lineHRef = useRef(1); // alto de la línea (centro 1er marcador → centro último)
  const fracsRef = useRef<number[]>([]); // posición de cada marcador como fracción de la línea
  const [active, setActive] = useState<boolean[]>(p.steps.map(() => false));

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const measure = () => {
      const markers = el.querySelectorAll<HTMLElement>("[data-marker]");
      if (markers.length < 2) return;
      const trackTop = el.getBoundingClientRect().top;
      const centers = Array.from(markers).map(
        (m) => m.getBoundingClientRect().top - trackTop + m.offsetHeight / 2
      );
      const top = centers[0];
      const h = Math.max(1, centers[centers.length - 1] - top);
      lineTopRef.current = top;
      lineHRef.current = h;
      fracsRef.current = centers.map((c) => (c - top) / h);
      el.style.setProperty("--line-top", `${top}px`);
      el.style.setProperty("--line-h", `${h}px`);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (document.fonts?.ready) document.fonts.ready.then(measure);

    if (reduce) {
      el.style.setProperty("--p", "1");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActive(p.steps.map(() => true));
      return () => ro.disconnect();
    }

    let raf = 0;
    let scheduled = false;
    const update = () => {
      scheduled = false;
      const trackTop = el.getBoundingClientRect().top;
      const lineTopScreen = trackTop + lineTopRef.current;
      const reveal = window.innerHeight * REVEAL;
      const progress = Math.min(
        1,
        Math.max(0, (reveal - lineTopScreen) / lineHRef.current)
      );
      el.style.setProperty("--p", progress.toFixed(4));
      const fracs = fracsRef.current;
      setActive((prev) => {
        // exige algo de avance real (evita que el paso 1 salga encendido antes
        // de llegar a la sección) y enciende cada paso al alcanzarlo el trazo
        const next = fracs.map((f) => progress > 0.01 && progress >= f - 0.001);
        return next.some((v, i) => v !== prev[i]) ? next : prev;
      });
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {/* Riel gris fijo + relleno verde cuya ALTURA crece con --p (sin SVG
              ni dash: imposible que queden huecos; a p=1 cubre todo). */}
          <div className={styles.rail} aria-hidden="true">
            <div className={styles.railFill} />
          </div>

          <ol className={styles.steps}>
            {p.steps.map((step, i) => (
              <li
                key={step.title}
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
