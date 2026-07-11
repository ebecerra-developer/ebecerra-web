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
  // Variante más discreta (menos inclinación + subida sutil en hover). La usan
  // las cards de la sección Servicios para que las 4 se comporten igual.
  subtle?: boolean;
  children: ReactNode;
};

const MAX_DEG = 6.5;
const SUBTLE_DEG = 3;
// Desplazamiento 2D (px) para la variante `subtle`: se mueve hacia el cursor sin
// rotación 3D, así el texto no se promociona a capa de GPU y queda nítido.
const SHIFT = 3;

// Card con inclinación 3D que sigue al cursor (parallax sutil). Degrada a estático
// con prefers-reduced-motion. Polimórfico: <div> o <a> (cards-enlace).
export default function TiltCard({
  as = "div",
  href,
  target,
  rel,
  ariaLabel,
  className = "",
  subtle = false,
  children,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const maxDeg = subtle ? SUBTLE_DEG : MAX_DEG;
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
    el.style.setProperty("--ry", `${(px - 0.5) * 2 * maxDeg}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 2 * maxDeg}deg`);
    el.style.setProperty("--tx", `${(px - 0.5) * 2 * SHIFT}px`);
    el.style.setProperty("--ty", `${(py - 0.5) * 2 * SHIFT}px`);
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
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
  }

  const cls = [styles.tilt, subtle && styles.subtle, className]
    .filter(Boolean)
    .join(" ");

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
