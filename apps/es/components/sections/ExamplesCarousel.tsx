"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./ExamplesCarousel.module.css";

type Props = {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
};

export default function ExamplesCarousel({
  children,
  prevLabel,
  nextLabel,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>(":scope > *");
    const step = first ? first.offsetWidth + 20 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className={styles.wrap}>
      <div ref={trackRef} className={styles.track}>
        {children}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.btn}
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label={prevLabel}
        >
          ←
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label={nextLabel}
        >
          →
        </button>
      </div>
    </div>
  );
}
