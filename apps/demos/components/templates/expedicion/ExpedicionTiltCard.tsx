"use client";

import { useRef, type ReactNode } from "react";

/**
 * Tarjeta con tilt 3D que sigue al cursor (como las cards de ebecerra.es): al
 * pasar el ratón por encima, la tarjeta se inclina hacia donde está el cursor y
 * se eleva un poco, como si flotara y el puntero ejerciese fuerza. Se desactiva
 * en punteros táctiles (no hay hover) y respeta prefers-reduced-motion.
 *
 * El transform se fija por JS (animación dinámica, no estilo estático). Durante
 * el movimiento la transición es muy corta (sigue al cursor); al salir, vuelve
 * suave a su sitio.
 */
const MAX_DEG = 8;

export default function ExpedicionTiltCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const enabledRef = useRef<boolean | null>(null);

  function enabled() {
    if (enabledRef.current === null) {
      enabledRef.current =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return enabledRef.current;
  }

  function onMove(e: React.PointerEvent<HTMLLIElement>) {
    const el = ref.current;
    if (!el || !enabled()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 0.08s ease-out";
    el.style.transform = `perspective(820px) rotateX(${(-py * MAX_DEG).toFixed(2)}deg) rotateY(${(px * MAX_DEG).toFixed(2)}deg) translateY(-7px) scale(1.015)`;
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
    el.style.transform = "";
  }

  return (
    <li
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </li>
  );
}
