"use client";

import { useEffect, useRef, useState } from "react";
import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import GestoriaCountdown from "./GestoriaCountdown";
import styles from "./GestoriaHero.module.css";

/**
 * Hero — apertura del arco "del lío al orden". Recibos y números desordenados se
 * alinean y se archivan en una carpeta limpia con un check verde "al día".
 * La animación va EN BUCLE (lío → orden → lío …) y tiene un botón play/pausa
 * para detenerla. Transición CSS (animamos transform + top/left juntos, suave).
 * Reduced-motion → estado ordenado fijo, sin bucle ni botón.
 */
export default function GestoriaHero({ content }: { content: GestoriaContent }) {
  const h = content.hero;
  const [ordered, setOrdered] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [showControl, setShowControl] = useState(false);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrdered(true);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowControl(true);
    }
  }, []);

  useEffect(() => {
    if (reduceRef.current || !playing) return;
    let intervalId = 0;
    const startId = window.setTimeout(() => {
      setOrdered(true);
      intervalId = window.setInterval(() => {
        setOrdered((o) => !o);
      }, 3200);
    }, 800);
    return () => {
      window.clearTimeout(startId);
      window.clearInterval(intervalId);
    };
  }, [playing]);

  const papers = [1, 2, 3, 4, 5];

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {h.kicker}
          </p>

          <h1 id="hero-heading" className={styles.heading}>
            {h.headingLead}{" "}
            <span className={styles.headingAccent}>{h.headingAccent}</span>{" "}
            {h.headingTail}
          </h1>

          <p className={styles.sub}>{h.sub}</p>

          <div className={styles.sello}>
            <span className={styles.selloSeal} aria-hidden="true">
              <GestoriaIcon name="shield" className={styles.selloIcon} />
            </span>
            <span className={styles.selloText}>
              <span className={styles.selloLabel}>
                {h.sello.label} · {h.sello.number}
              </span>
              <span className={styles.selloNote}>{h.sello.note}</span>
            </span>
          </div>

          <div className={styles.ctas}>
            <a href="#contacto" className={styles.ctaPrimary}>
              {h.ctaPrimary}
            </a>
            <a
              href={content.whatsapp.href}
              className={styles.ctaSecondary}
              target="_blank"
              rel="noopener"
            >
              <GestoriaIcon name="chat" className={styles.ctaIcon} />
              {h.ctaSecondary}
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={`${styles.stage} ${ordered ? styles.ordered : ""}`}>
            <span className={styles.chaosLabel} aria-hidden="true">
              {h.chaosNote}
            </span>
            <span className={styles.orderLabel} aria-hidden="true">
              {h.orderNote}
            </span>

            {showControl && (
              <button
                type="button"
                className={styles.animToggle}
                onClick={() => setPlaying((v) => !v)}
                aria-label={playing ? h.pauseAnim : h.playAnim}
              >
                <GestoriaIcon
                  name={playing ? "pause" : "play"}
                  className={styles.animIcon}
                />
              </button>
            )}

            <div className={styles.papers} aria-hidden="true">
              {papers.map((n) => (
                <div key={n} className={`${styles.paper} ${styles[`paper${n}`]}`}>
                  <span className={styles.paperLine} />
                  <span className={styles.paperLine} />
                  <span className={styles.paperNum}>
                    {["303", "130", "036", "390", "111"][n - 1]}
                  </span>
                </div>
              ))}

              <div className={styles.folder}>
                <span className={styles.folderTab} />
                <span className={styles.folderCheck}>
                  <GestoriaIcon name="check" className={styles.folderCheckIcon} />
                </span>
              </div>
            </div>
          </div>

          <div className={styles.countdownSlot}>
            <GestoriaCountdown
              deadlines={content.countdown.deadlines}
              strings={{
                label: content.countdown.label,
                daysWord: content.countdown.daysWord,
                dayWord: content.countdown.dayWord,
                todayLabel: content.countdown.todayLabel,
                nextLabel: content.countdown.nextLabel,
                aria: content.countdown.aria,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
