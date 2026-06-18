"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import styles from "./TiltCard.module.css";

type Props = {
  as?: "div" | "a";
  href?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

const MAX_DEG = 6.5;

// Card con inclinación 3D que sigue al cursor (parallax sutil). Degrada a estático
// con prefers-reduced-motion. Polimórfico: <div> o <a> (cards-enlace).
export default function TiltCard({
  as = "div",
  href,
  target,
  rel,
  ariaLabel,
  className = "",
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  // Rect capturado al entrar el cursor, con la card EN REPOSO (sin tilt). Se usa
  // para todo el movimiento: así el cálculo no se realimenta con la propia
  // rotación 3D ni con un scale heredado (p. ej. el wrapper .reveal del scroll),
  // que deformarían la caja que devuelve getBoundingClientRect en cada frame.
  const rectRef = useRef<DOMRect | null>(null);

  function captureRect() {
    const el = ref.current;
    if (el) rectRef.current = el.getBoundingClientRect();
  }

  function handleEnter() {
    captureRect();
  }

  function handleMove(e: MouseEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    // Sin transición mientras se mueve → sigue al cursor al instante (fluido).
    el.style.transition = "transform 0s";
    // Rect de reposo capturado al entrar; si por lo que sea falta, leer ahora.
    const r = rectRef.current ?? el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 2 * MAX_DEG}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 2 * MAX_DEG}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    rectRef.current = null;
    // Vuelve a la transición CSS para que el reset sea suave.
    el.style.transition = "";
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  const cls = `${styles.tilt} ${className}`.trim();

  if (as === "a") {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={cls}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        {children}
      </a>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cls}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
