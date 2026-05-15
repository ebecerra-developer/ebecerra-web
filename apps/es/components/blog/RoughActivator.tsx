"use client";

import { useEffect } from "react";
import { annotate } from "rough-notation";

/**
 * Activa rough-notation en spans con [data-rough] cuando entran en viewport.
 * Renderiza nada visible — solo enlaza el efecto.
 *
 * El serializer de PortableContent emite:
 *   <span data-rough="underline">…</span>
 *   <span data-rough="circle">…</span>
 *
 * El root busca todos esos spans y los anima con IntersectionObserver.
 */
export default function RoughActivator({
  rootSelector,
}: {
  rootSelector: string;
}) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>("[data-rough]");
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          if (el.dataset.roughActive === "true") continue;
          el.dataset.roughActive = "true";
          const type = el.dataset.rough === "circle" ? "circle" : "underline";
          const annotation = annotate(el, {
            type,
            color: "var(--accent, #047857)",
            strokeWidth: 1.6,
            padding: type === "circle" ? 6 : 2,
            iterations: 1,
            animationDuration: 700,
          });
          annotation.show();
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.4 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootSelector]);

  return null;
}
