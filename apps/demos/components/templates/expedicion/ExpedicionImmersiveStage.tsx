"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./ExpedicionImmersiveStage.module.css";

/**
 * Orquestador inmersivo de la plantilla Expedición.
 *
 * Modelo (replica el prototipo v7): el contenido NO scrollea como un documento;
 * son ESCENAS centradas que se cruzan con cross-fade mientras el fondo POV avanza
 * con el scroll. Sensación de "ir hacia delante".
 *
 * Motor: fondo + escenas en `position: fixed` (cubren siempre el viewport, sin
 * huecos arriba; y la rueda del ratón scrollea la ventana con normalidad — un
 * contenedor `sticky`/`overflow` capturaría la rueda). Un SPACER da la distancia
 * de scroll. Al final, toda la capa inmersiva se DESVANECE (`--stage-fade`) y el
 * footer (bloque normal fuera de este componente, con z-index por encima) sube
 * sobre el fondo oscuro → pie TRADICIONAL limpio, sin escenas a medias detrás.
 *
 * Claves:
 *  - Una sola fuente de progreso (scroll sobre el spacer) + un solo rAF.
 *  - Escenas con `overflow: hidden` (sin scroll interno) → la rueda nunca queda
 *    atrapada; siempre scrollea la ventana.
 *  - Mejora progresiva: SSR/fallback = scroll normal (mismo DOM); el inmersivo se
 *    activa en cliente solo con capacidad (desktop ancho Y alto, no reduced-motion,
 *    no save-data) y tras cargar frames.
 *  - rAF on-demand. a11y: escenas inactivas `inert` + ocultas.
 */

const FRAME_COUNT = 93;
const framePath = (i: number) =>
  `/immersive/expedicion/frames/f_${String(i).padStart(3, "0")}.webp`;
const SCENE_VH = 120; // distancia de scroll por escena

// Secuencia de ramas de primer plano (PNG con alpha). En cada "pasada" se muestra
// la SIGUIENTE de la lista, anclada a su borde; crece desde ahí y se desvanece al
// pasarla. Empieza por la de todos los bordes y va rotando lado a lado.
const BRANCHES: { img: string; edge: string }[] = [
  { img: "/immersive/ramas_variadas.webp", edge: "all" },
  { img: "/immersive/ramas_europeas_izq.webp", edge: "left" },
  { img: "/immersive/ramas_europeas_inf.webp", edge: "bottom" },
  { img: "/immersive/ramas_europeas_der.webp", edge: "right" },
  { img: "/immersive/ramas_europeas_sup.webp", edge: "top" },
  { img: "/immersive/ramas_mediterraneas_izq.webp", edge: "left" },
  { img: "/immersive/ramas_mediterraneas.webp", edge: "all" },
  { img: "/immersive/ramas_mediterraneas_der.webp", edge: "right" },
];

export default function ExpedicionImmersiveStage({
  children,
  scrollLabel,
}: {
  children: ReactNode;
  scrollLabel: string;
}) {
  const scenes = Children.toArray(children).filter(isValidElement);
  const N = scenes.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"normal" | "immersive">("normal");

  useEffect(() => {
    // El inmersivo (escenas fijas + cross-fade sobre el metraje POV) corre en
    // ESCRITORIO y en MÓVIL. La diferencia: en escritorio una sección = una
    // pantalla (cabe entera); en móvil una sección alta NO cabe legible, así que
    // se le da distancia de scroll proporcional a su alto y PANEA verticalmente
    // (revelando su contenido de arriba a abajo) — "una pantalla desktop = varias
    // en móvil". El fundido cruzado se reserva para el paso ENTRE secciones.
    // Caemos a scroll plano solo si: menos movimiento, ahorro de datos, o ventana
    // tan baja (móvil horizontal) que no luce.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const short = window.matchMedia("(max-height: 480px)").matches;
    const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
    if (reduce || short || conn?.saveData) return;
    const isMobile = window.matchMedia(
      "(pointer: coarse), (max-width: 900px)",
    ).matches;

    if (!rootRef.current || !canvasRef.current || !spacerRef.current) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const spacer = spacerRef.current;
    const hint = hintRef.current;
    const footerEl =
      root.parentElement?.querySelector("footer") ??
      document.querySelector("footer");
    const navEl = document.querySelector<HTMLElement>("header");
    const ctxMaybe = canvas.getContext("2d");
    if (!ctxMaybe) return;
    const ctx = ctxMaybe;

    const sceneEls = Array.from(root.querySelectorAll<HTMLElement>("[data-scene]"));
    const branchEl = root.querySelector<HTMLElement>("[data-branch]");
    BRANCHES.forEach((b) => {
      const im = new Image();
      im.src = b.img;
    }); // precarga de las ramas para que el cambio sea sin parpadeo
    let lastBranchIdx = -1;
    let cancelled = false;
    let tooLate = false;

    // ---- precarga con umbral + ventana de tiempo ----
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let ok = 0;
    let activated = false;
    // Activamos en cuanto hay unos pocos frames (el resto sigue cargando en
    // segundo plano y el póster cubre lo que aún no está) → la experiencia
    // aparece rápido en vez de esperar a que carguen los 93.
    const THRESHOLD = Math.min(FRAME_COUNT, 10);
    // Esperamos también a que las webfonts (Oswald/Manrope) estén medidas ANTES de
    // activar: si medimos con la fuente de sistema y luego cambia Oswald, las
    // alturas bailan y se ve el "reajuste" feo al cargar. Con esto, el primer
    // pintado del inmersivo ya está bien medido.
    let fontsReady = !document.fonts || document.fonts.status === "loaded";
    if (!fontsReady && document.fonts) {
      document.fonts.ready.then(() => {
        fontsReady = true;
        maybeActivate();
      });
    }

    function maybeActivate() {
      if (activated || cancelled || tooLate) return;
      const f0 = images[0];
      if (!f0 || !f0.complete || !f0.naturalWidth || ok < THRESHOLD) return;
      if (!fontsReady) return; // espera a las fuentes para no remedir al cargar
      activated = true;
      document.documentElement.classList.add("exp-immersive"); // oculta la barra de scroll nativa
      // El JS controla el scroll (rAF + easing propio). Forzamos scroll-behavior
      // auto INLINE (gana a la hoja global smooth) o cada window.scrollTo por
      // frame reinicia la animación nativa y el scroll se atasca (el click del
      // nav no avanzaba por esto).
      document.documentElement.style.scrollBehavior = "auto";
      document.documentElement.classList.toggle("exp-mobile", isMobile);
      setMode("immersive");
      requestAnimationFrame(() => {
        fit();
        if (!isMobile) fitScenes(); // móvil panea a tamaño completo, no escala
        layout(); // mide alturas → bounds + altura del spacer
        wake();
      });
    }

    // Alto interior REAL del marco = lo mismo que define el CSS de la escena:
    //   innerHeight − frame-top − inset-abajo.
    // El borde superior del marco arranca justo bajo el nav (alto del nav + 10,
    // medido con `offsetHeight` para IGNORAR la barra DEMO de preview, que empuja
    // el nav pero no existe en la web real). El inferior, el inset del marco.
    // Le quitamos un AIRE desde la línea del marco para que el contenido no se vea
    // agobiado pegado al borde. Pequeño, y un poco mayor en móvil (pantalla chica
    // abruma más con el contenido a tope).
    function frameInteriorH() {
      const navClear = (navEl?.offsetHeight ?? 68) + 10;
      const inset = Math.min(26, Math.max(12, window.innerWidth * 0.02));
      const margin = isMobile ? 144 : 44; // aire pequeño desde el marco
      return window.innerHeight - navClear - inset - margin;
    }

    // Auto-ajuste (escritorio): si la escena a 100% CABE en el marco, se deja a
    // 100%. Solo se REDUCE cuando no cabe, y lo justo para que quepa. Nunca agranda
    // ni toca una escena que ya cabe.
    function fitScenes() {
      const availH = frameInteriorH();
      for (const sceneEl of sceneEls) {
        const section = sceneEl.firstElementChild as HTMLElement | null;
        if (!section) continue;
        section.style.transform = "none";
        const h = section.scrollHeight;
        const s = h > availH ? availH / h : 1; // solo reduce si no cabe
        section.style.transformOrigin = "center center";
        section.style.transform = s < 1 ? `scale(${s.toFixed(3)})` : "";
      }
    }

    // ---- Reparto del scroll por escena ----
    // bounds[i]..bounds[i+1] = tramo de progreso (0..1) de la escena i.
    // panDist[i] = px que hay que panear (0 si la escena cabe entera).
    // En escritorio los tramos son UNIFORMES (1 escena = 1 pantalla). En móvil son
    // PONDERADOS por alto: una escena alta recibe más scroll y panea su contenido.
    let bounds: number[] = sceneEls.map((_, i) => i / N).concat(1);
    let panDist: number[] = sceneEls.map(() => 0);
    let unitsTotal = N;
    function layout() {
      if (!isMobile) {
        bounds = sceneEls.map((_, i) => i / N).concat(1);
        panDist = sceneEls.map(() => 0);
        unitsTotal = N;
        spacer.style.height = `${N * SCENE_VH}vh`;
        return;
      }
      const availH = frameInteriorH(); // mismo interior de marco que el escritorio
      const units: number[] = [];
      panDist = [];
      for (const sceneEl of sceneEls) {
        const section = sceneEl.firstElementChild as HTMLElement | null;
        section?.style.removeProperty("transform"); // medir a tamaño natural
        const h = section ? section.scrollHeight : availH;
        const d = Math.max(0, h - availH);
        panDist.push(d);
        units.push(1 + d / availH); // 1 pantalla + lo que haga falta para panear
      }
      unitsTotal = units.reduce((a, b) => a + b, 0) || N;
      bounds = [0];
      let acc = 0;
      for (const u of units) {
        acc += u;
        bounds.push(acc / unitsTotal);
      }
      spacer.style.height = `${(unitsTotal * SCENE_VH).toFixed(1)}vh`;
    }

    const frame0 = new Image();
    frame0.setAttribute("fetchpriority", "high");
    frame0.onload = frame0.onerror = () => {
      ok++;
      maybeActivate();
    };
    frame0.src = framePath(1);
    images[0] = frame0;

    function loadRest() {
      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.onload = () => {
          ok++;
          maybeActivate();
        };
        img.onerror = () => maybeActivate();
        img.src = framePath(i + 1);
        images[i] = img;
      }
    }
    if (document.readyState === "complete") loadRest();
    else window.addEventListener("load", loadRest, { once: true });

    const tooLateTimer = window.setTimeout(() => {
      tooLate = true;
    }, 12000);

    // ---- canvas (cover) ----
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lastDrawn = -1;
    function fit() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawn = -1;
    }
    function draw(idx: number) {
      const i = Math.max(0, Math.min(FRAME_COUNT - 1, idx | 0));
      const img = images[i];
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
      lastDrawn = i;
    }

    // ---- progreso = scroll sobre el spacer (altura estable) ----
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    function getProgress() {
      const total = spacer.offsetHeight - window.innerHeight;
      const scrolled = -spacer.getBoundingClientRect().top;
      return total > 0 ? clamp(scrolled / total, 0, 1) : 0;
    }

    // ancho de fundido (en progreso) de la escena idx = ~media pantalla, acotado
    // a media escena. Define dónde cruza con la vecina (fundido entre secciones).
    function fadeW(idx: number) {
      const span = bounds[idx + 1] - bounds[idx];
      return Math.min(span * 0.5, (0.5 / unitsTotal));
    }

    // ---- visibilidad de escena (meseta + fundido en bordes del tramo) ----
    function sceneVis(p: number, idx: number) {
      const s = bounds[idx];
      const e = bounds[idx + 1];
      const fw = fadeW(idx);
      const inStart = idx === 0 ? -2 : s;
      const inEnd = idx === 0 ? -1 : s + fw;
      const outStart = idx === N - 1 ? 2 : e - fw;
      const outEnd = idx === N - 1 ? 3 : e;
      if (p <= inStart || p >= outEnd) return 0;
      if (p < inEnd) return (p - inStart) / (inEnd - inStart);
      if (p > outStart) return 1 - (p - outStart) / (outEnd - outStart);
      return 1;
    }

    let curFrame = 0;
    let running = false;
    let rafId = 0;
    function loop() {
      const p = getProgress();
      const target = p * (FRAME_COUNT - 1);
      curFrame += (target - curFrame) * 0.2;
      if (Math.round(curFrame) !== lastDrawn) draw(curFrame);

      if (hint) hint.style.opacity = p > 0.03 ? "0" : "1";

      let bestIdx = 0;
      let bestVis = 0;
      for (let i = 0; i < sceneEls.length; i++) {
        const vis = sceneVis(p, i);
        const el = sceneEls[i];
        el.style.opacity = vis.toFixed(3);
        el.style.visibility = vis < 0.01 ? "hidden" : "visible";
        if (isMobile) {
          // PANEO: dentro de su tramo, la sección se desliza de su parte de arriba
          // (+D/2) a la de abajo (-D/2). Solo panea en la zona central; en los
          // bordes (donde cruza con la vecina) se queda quieta mostrando arriba/abajo.
          const section = el.firstElementChild as HTMLElement | null;
          if (section) {
            const span = bounds[i + 1] - bounds[i];
            const fwFrac = span > 0 ? fadeW(i) / span : 0;
            const localT = span > 0 ? clamp((p - bounds[i]) / span, 0, 1) : 0;
            const panT = clamp((localT - fwFrac) / (1 - 2 * fwFrac || 1), 0, 1);
            const ty = (panDist[i] / 2) * (1 - 2 * panT);
            section.style.transform = ty ? `translateY(${ty.toFixed(1)}px)` : "";
          }
          el.style.transform = "";
        } else {
          el.style.transform = `translateY(${(1 - vis) * 26}px)`;
        }
        if (vis > bestVis) {
          bestVis = vis;
          bestIdx = i;
        }
      }
      // a11y: SIEMPRE hay exactamente una escena no-inert (la más visible, sin
      // umbral → ni siquiera a mitad de cross-fade quedan todas inert y el foco a
      // la deriva). Y NUNCA inertamos la escena que contiene el foco actual (si no,
      // al enfocar un control y despertar el rAF se perdería el foco).
      const active = document.activeElement;
      for (let i = 0; i < sceneEls.length; i++) {
        const el = sceneEls[i];
        const isActive =
          i === bestIdx || (active !== document.body && el.contains(active));
        el.style.pointerEvents = isActive ? "auto" : "none";
        if (isActive) el.removeAttribute("inert");
        else el.setAttribute("inert", "");
      }

      // Ramas de primer plano: en cada pasada se muestra la SIGUIENTE imagen de la
      // secuencia (ancladas a su borde por transform-origin), crece desde su borde
      // y se desvanece al pasarla. El cambio de imagen ocurre con la rama invisible
      // (opacidad 0), así que no se ve el salto.
      if (branchEl) {
        const passes = BRANCHES.length;
        const prog = p * passes;
        const idx = Math.floor(prog) % passes;
        const cyc = prog % 1;
        if (idx !== lastBranchIdx) {
          lastBranchIdx = idx;
          const cfg = BRANCHES[idx];
          branchEl.dataset.edge = cfg.edge;
          branchEl.style.backgroundImage = `url("${cfg.img}")`;
        }
        branchEl.style.transform = `scale(${(1 + cyc * 0.6).toFixed(3)})`;
        branchEl.style.opacity = Math.sin(cyc * Math.PI).toFixed(3);
      }

      // La LÍNEA del marco arranca justo bajo el nav REAL: con la barra DEMO el nav
      // baja → marco más pequeño; al hacer scroll la barra DEMO se va → marco un
      // poco más grande. Así la línea nunca cruza el texto del nav. (El centrado del
      // contenido NO usa esto, usa `--content-top`, para no bajar con la barra.)
      if (navEl) {
        const nb = navEl.getBoundingClientRect().bottom;
        root.style.setProperty("--frame-top", `${Math.max(0, nb + 10).toFixed(0)}px`);
      }

      // fundido de salida: cuando el footer entra desde abajo, la capa inmersiva
      // se desvanece para que el pie suba sobre el fondo oscuro (no sobre escenas).
      if (footerEl) {
        const ft = footerEl.getBoundingClientRect().top;
        const fh = footerEl.offsetHeight || window.innerHeight * 0.4;
        const rise = clamp((window.innerHeight - ft) / fh, 0, 1); // 0=entra, 1=en reposo
        // toda la capa inmersiva SUBE y se oculta por arriba (no se "tapa" en su
        // sitio); el footer, de alto normal, queda abajo como un pie tradicional.
        root.style.setProperty("--stage-shift", `${(-window.innerHeight * rise).toFixed(1)}px`);
        root.style.setProperty("--stage-fade", (1 - clamp(rise * 1.5, 0, 1)).toFixed(3));
      }

      if (Math.abs(target - curFrame) < 0.01) {
        running = false; // duerme hasta el próximo scroll
        return;
      }
      rafId = requestAnimationFrame(loop);
    }
    function wake() {
      if (!running && !cancelled) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    }

    const onScroll = () => wake();
    function relayout() {
      if (!isMobile) fitScenes();
      layout();
      wake();
    }
    const onResize = () => {
      fit();
      relayout();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // Re-medir cuando cambian las alturas reales (webfonts, imágenes, reflow). Sin
    // esto, según el orden de carga (caché) la primera medición sale distinta y las
    // pantallas aparecen a veces grandes y a veces pequeñas. El RO converge al
    // tamaño correcto. Debounced a un rAF para no recalcular en cada micro-cambio.
    let roPending = false;
    const ro = new ResizeObserver(() => {
      if (roPending) return;
      roPending = true;
      requestAnimationFrame(() => {
        roPending = false;
        if (!cancelled && activated) relayout();
      });
    });
    for (const el of sceneEls) {
      const section = el.firstElementChild;
      if (section) ro.observe(section);
    }

    // Scroll animado LENTO hacia una posición (en vez del "smooth" nativo, que es
    // muy rápido). La duración crece con la distancia → un salto largo tarda más,
    // dando tiempo a que el metraje y las escenas avancen de verdad. El usuario
    // puede interrumpirlo con la rueda o el dedo.
    let scrollAnim = 0;
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    function animateScrollTo(targetY: number) {
      cancelAnimationFrame(scrollAnim);
      const startY = window.scrollY;
      const dist = targetY - startY;
      if (Math.abs(dist) < 4) return;
      const dur = Math.min(
        2400,
        Math.max(900, (Math.abs(dist) / window.innerHeight) * 850),
      );
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, startY + dist * easeInOutCubic(t));
        wake();
        if (t < 1) scrollAnim = requestAnimationFrame(step);
      };
      scrollAnim = requestAnimationFrame(step);
    }
    const cancelScrollAnim = () => cancelAnimationFrame(scrollAnim);
    window.addEventListener("wheel", cancelScrollAnim, { passive: true });
    window.addEventListener("touchstart", cancelScrollAnim, { passive: true });

    // anclas → scroll animado lento a la sección destino. Las escenas son fijas
    // (el anchor nativo no tiene a dónde ir): movemos el scroll a la posición del
    // spacer que corresponde al INICIO del tramo de esa escena (un pelín dentro,
    // para que ya esté fundida y mostrando su parte de arriba).
    const onAnchorClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      const sceneEl = document.getElementById(id)?.closest<HTMLElement>("[data-scene]");
      if (!sceneEl) return;
      const idx = sceneEls.indexOf(sceneEl);
      if (idx < 0) return;
      e.preventDefault();
      const total = spacer.offsetHeight - window.innerHeight;
      const spacerTop = window.scrollY + spacer.getBoundingClientRect().top;
      const span = bounds[idx + 1] - bounds[idx];
      const p = bounds[idx] + span * (idx === 0 ? 0 : 0.18);
      animateScrollTo(spacerTop + p * total);
    };
    document.addEventListener("click", onAnchorClick);

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelled = true;
      clearTimeout(tooLateTimer);
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(scrollAnim);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", loadRest);
      window.removeEventListener("wheel", cancelScrollAnim);
      window.removeEventListener("touchstart", cancelScrollAnim);
      document.removeEventListener("click", onAnchorClick);
      if (branchEl) {
        branchEl.style.transform = "";
        branchEl.style.opacity = "";
        branchEl.style.backgroundImage = "";
      }
      spacer.style.height = "";
      document.documentElement.classList.remove("exp-immersive");
      document.documentElement.classList.remove("exp-mobile");
      document.documentElement.style.scrollBehavior = "";
      root.style.removeProperty("--stage-fade");
      root.style.removeProperty("--stage-shift");
      root.style.removeProperty("--frame-top");
      for (const el of sceneEls) {
        el.removeAttribute("inert");
        el.style.opacity = "";
        el.style.transform = "";
        el.style.visibility = "";
        el.style.pointerEvents = "";
        const section = el.firstElementChild as HTMLElement | null;
        if (section) section.style.transform = "";
      }
    };
  }, [N]);

  return (
    <div className={styles.root} data-mode={mode} ref={rootRef}>
      <div className={styles.poster} aria-hidden="true" />
      <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
      <div className={styles.branches} aria-hidden="true">
        <div className={styles.branch} data-branch="" data-edge="all" />
      </div>
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.frame} aria-hidden="true">
        <span className={`${styles.corner} ${styles.tl}`} />
        <span className={`${styles.corner} ${styles.tr}`} />
        <span className={`${styles.corner} ${styles.bl}`} />
        <span className={`${styles.corner} ${styles.br}`} />
      </div>

      <div className={styles.scenes}>
        {scenes.map((child, i) => (
          <div className={styles.scene} data-scene={i} key={i}>
            {child}
          </div>
        ))}
      </div>

      <div className={styles.scrollHint} ref={hintRef} aria-hidden="true">
        <span>{scrollLabel}</span>
        <span className={styles.arrow} />
      </div>

      <div className={styles.spacer} ref={spacerRef} aria-hidden="true" />
    </div>
  );
}
