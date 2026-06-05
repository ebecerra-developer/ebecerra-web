"use client";

import { useEffect } from "react";

/**
 * Revela las secciones al hacer scroll (fade + desplazamiento hacia arriba),
 * para que el contenido "aparezca" según avanzas por el sendero — como los
 * paneles de los prototipos. No renderiza nada.
 *
 * Aplica el estado oculto por JS (no en SSR) → sin FOUC ni problemas sin JS /
 * para SEO. Respeta prefers-reduced-motion (deja todo visible).
 */
export default function ExpedicionReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("#main > section")
    ).slice(1); // el hero (primero) no se oculta

    for (const el of sections) {
      el.style.opacity = "0";
      el.style.transform = "translateY(36px)";
      el.style.transition =
        "opacity 0.7s cubic-bezier(0.22,0.78,0.24,1), transform 0.7s cubic-bezier(0.22,0.78,0.24,1)";
      el.style.willChange = "opacity, transform";
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "none";
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    for (const el of sections) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
