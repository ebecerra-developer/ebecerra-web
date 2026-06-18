"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ExamplesStage.module.css";

type Props = { children: ReactNode };

// Carrusel de ejemplos atado al scroll. La zona se fija (pin) y, al scrollear en
// vertical, las tarjetas panean en horizontal; la del centro manda (grande/nítida)
// y las de los lados encogen, se atenúan y desenfocan (cover-flow). Solo se activa
// en desktop con motion permitido; en el resto (móvil / reduced-motion) queda el
// swipe horizontal nativo del CSS base.
export default function ExamplesStage({ children }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!stage || !track || !frame) return;
    // Locales no-null para que los closures internos conserven el tipo.
    const stageEl: HTMLDivElement = stage;
    const trackEl: HTMLDivElement = track;
    const frameEl: HTMLDivElement = frame;

    // Activo también en móvil (atado al scroll); solo cae al swipe con
    // prefers-reduced-motion (accesibilidad).
    const activeMq = window.matchMedia("(prefers-reduced-motion: no-preference)");

    // Cuánto scroll cuesta el paneo: <1 = el paneo avanza más por scroll (menos
    // scroll total). 1 sería 1:1 px-scroll/px-pan.
    const PAN_FACTOR = 0.8;
    let panRange = 0; // recorrido horizontal (centro de la 1ª al centro de la última)
    let tx0 = 0; // translateX con la primera centrada (progreso 0)
    let raf = 0;

    function layout() {
      const cards = trackEl.children;
      if (!cards.length) {
        panRange = 0;
        tx0 = 0;
        stageEl.style.height = `${window.innerHeight}px`;
        return;
      }
      // Centrado por offset real: el track arranca en el borde del marco (que está
      // metido por el padding de la sección), no en el borde del viewport. Calculo
      // el translateX que pone el CENTRO de cada tarjeta en el CENTRO del viewport.
      const first = cards[0] as HTMLElement;
      const last = cards[cards.length - 1] as HTMLElement;
      const firstCenter = first.offsetLeft + first.offsetWidth / 2;
      const lastCenter = last.offsetLeft + last.offsetWidth / 2;
      panRange = Math.max(0, lastCenter - firstCenter);
      const baseLeft = frameEl.getBoundingClientRect().left; // X del borde del track
      tx0 = window.innerWidth / 2 - baseLeft - firstCenter;
      // Altura de la zona = una pantalla + el recorrido escalado por PAN_FACTOR
      // (el paneo recorre todo el track en menos scroll).
      stageEl.style.height = `${window.innerHeight + panRange * PAN_FACTOR}px`;
    }

    function update() {
      const top = stageEl.getBoundingClientRect().top;
      const range = stageEl.offsetHeight - window.innerHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, -top / range)) : 0;
      const x = tx0 - progress * panRange;
      trackEl.style.setProperty("--x", `${x}px`);

      // Cover-flow: cada tarjeta según su distancia al centro del viewport.
      const center = window.innerWidth / 2;
      const cards = trackEl.children;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const r = card.getBoundingClientRect();
        const cardCenter = r.left + r.width / 2;
        const d = Math.min(
          1,
          Math.abs(cardCenter - center) / (window.innerWidth * 0.5),
        );
        card.style.setProperty("--s", (1 - d * 0.26).toFixed(3));
        card.style.setProperty("--o", (1 - d * 0.5).toFixed(3));
      }
    }

    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    }

    function enable() {
      stageEl.classList.add(styles.active);
      layout();
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onLayout);
    }

    function disable() {
      stageEl.classList.remove(styles.active);
      stageEl.style.height = "";
      trackEl.style.removeProperty("--x");
      Array.from(trackEl.children).forEach((c) => {
        const el = c as HTMLElement;
        el.style.removeProperty("--s");
        el.style.removeProperty("--o");
      });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onLayout);
    }

    function onLayout() {
      layout();
      update();
    }

    function apply() {
      if (activeMq.matches) enable();
      else disable();
    }

    apply();
    activeMq.addEventListener("change", apply);

    return () => {
      activeMq.removeEventListener("change", apply);
      disable();
    };
  }, []);

  return (
    // data-stage: el recede del apilado (StackScroll) no debe aplicarle transform
    // (rompería el pin del carrusel); solo se le atenúa con opacidad.
    <div ref={stageRef} data-stage className={styles.stage}>
      <div ref={frameRef} className={styles.frame}>
        <div ref={trackRef} className={styles.track}>
          {children}
        </div>
      </div>
    </div>
  );
}
