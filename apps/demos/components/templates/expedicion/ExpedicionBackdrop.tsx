"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ExpedicionBackdrop.module.css";

/**
 * Fondo inmersivo PERSISTENTE de la plantilla Expedición.
 *
 * A diferencia de un hero, este fondo es `position: fixed` y cubre toda la
 * ventana durante TODA la página. El fotograma del POV se elige según el
 * progreso de scroll del documento entero (0 = arriba del todo, 1 = abajo),
 * así que el visitante "avanza" por el sendero mientras recorre toda la web.
 * El contenido (nav, secciones) va por encima, con fondos translúcidos.
 *
 * Técnica: canvas 2D + scroll nativo + rAF (sin dependencias). El marco fijo
 * y el follaje con parallax viven aquí para envolver toda la página.
 *
 * Fallback: móvil/táctil o prefers-reduced-motion → póster estático (sin
 * secuencia ni scrubbing), igual de inmersivo pero sin coste.
 */

const FRAME_COUNT = 93;
const framePath = (i: number) =>
  `/immersive/expedicion/frames/f_${String(i).padStart(3, "0")}.webp`;

export default function ExpedicionBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 820px), (pointer: coarse)").matches;
    if (reduce || small) return; // se queda el póster fijo

    if (!canvasRef.current || !rootRef.current) return;
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe;

    let cancelled = false;
    let raf = 0;
    let currentFrame = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    function fit() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const images: HTMLImageElement[] = [];
    function draw(idx: number) {
      const img = images[Math.max(0, Math.min(FRAME_COUNT - 1, idx | 0))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const ir = img.naturalWidth / img.naturalHeight;
      const cr = cw / ch;
      let w: number, h: number, x: number, y: number;
      if (cr > ir) {
        w = cw;
        h = cw / ir;
        x = 0;
        y = (ch - h) / 2;
      } else {
        h = ch;
        w = ch * ir;
        x = (cw - w) / 2;
        y = 0;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, x, y, w, h);
    }

    // ---- follaje generado (siluetas de hoja desenfocadas) ----
    let fgSeed = 71;
    const frnd = () => {
      fgSeed = (fgSeed * 16807) % 2147483647;
      return fgSeed / 2147483647;
    };
    function makeFoliage(
      el: HTMLElement,
      opts: { count: number; blur: number; anchor: "top" | "left" | "right" }
    ) {
      const c = document.createElement("canvas");
      const W = 720;
      const H = 720;
      c.width = W;
      c.height = H;
      const x = c.getContext("2d");
      if (!x) return;
      x.filter = `blur(${opts.blur}px)`;
      for (let i = 0; i < opts.count; i++) {
        let px = 0;
        let py = 0;
        if (opts.anchor === "top") {
          px = frnd() * W;
          py = Math.pow(frnd(), 1.6) * H * 0.85;
        } else if (opts.anchor === "left") {
          px = Math.pow(frnd(), 1.6) * W * 0.9;
          py = H - Math.pow(frnd(), 1.6) * H * 0.95;
        } else {
          px = W - Math.pow(frnd(), 1.6) * W * 0.9;
          py = H - Math.pow(frnd(), 1.6) * H * 0.95;
        }
        const size = 60 + frnd() * 150;
        const rot = frnd() * Math.PI * 2;
        const g = 14 + Math.floor(frnd() * 16);
        x.save();
        x.translate(px, py);
        x.rotate(rot);
        x.fillStyle = `rgba(${Math.floor(g * 0.5)}, ${g}, ${Math.floor(
          g * 0.55
        )}, ${0.55 + frnd() * 0.4})`;
        x.beginPath();
        x.moveTo(0, 0);
        x.quadraticCurveTo(size * 0.5, -size * 0.32, size, 0);
        x.quadraticCurveTo(size * 0.5, size * 0.32, 0, 0);
        x.fill();
        x.restore();
      }
      c.className = styles.foliageCanvas;
      el.appendChild(c);
    }

    const layerEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-layer]")
    );
    const layers = layerEls.map((el) => ({
      el,
      factor:
        el.dataset.layer === "canopy"
          ? 1.6
          : el.dataset.layer === "right"
            ? 1.25
            : 1.1,
    }));
    if (layerEls[0]) makeFoliage(layerEls[0], { count: 90, blur: 7, anchor: "top" });
    if (layerEls[1]) makeFoliage(layerEls[1], { count: 70, blur: 5, anchor: "left" });
    if (layerEls[2]) makeFoliage(layerEls[2], { count: 70, blur: 6, anchor: "right" });

    let loaded = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === FRAME_COUNT && !cancelled) {
          setInteractive(true);
          fit();
          draw(0);
        }
      };
      img.src = framePath(i + 1);
      images[i] = img;
    }

    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / window.innerWidth - 0.5;
      pointer.ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("resize", fit);

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    function tick() {
      const docEl = document.documentElement;
      const max = docEl.scrollHeight - window.innerHeight;
      const progress = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;

      const target = progress * (FRAME_COUNT - 1);
      currentFrame += (target - currentFrame) * 0.2;
      draw(currentFrame);

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const open = 1 + progress * 0.16;
      for (const L of layers) {
        const tx = -pointer.x * L.factor * 26;
        const ty = -pointer.y * L.factor * 16 + progress * L.factor * 40;
        L.el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${open})`;
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", fit);
    };
  }, []);

  return (
    <div className={styles.root} ref={rootRef} data-interactive={interactive} aria-hidden="true">
      <div className={styles.poster} />
      <canvas className={styles.canvas} ref={canvasRef} />
      <div className={styles.foliage} data-layer="canopy" />
      <div className={styles.foliage} data-layer="left" />
      <div className={styles.foliage} data-layer="right" />
      <div className={styles.grade} />
      <div className={styles.frameDeco}>
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />
      </div>
    </div>
  );
}
