import styles from "./Marquee.module.css";

type Props = {
  items: string[];
  tone?: "green" | "dark";
};

// Cinta a sangre con frases de valor separadas por ✦. Decorativa (aria-hidden):
// las frases también viven como copy real en otras secciones. Las frases vienen
// de Sanity (heroSection.marqueeItems).
export default function Marquee({ items, tone = "green" }: Props) {
  const clean = (items ?? []).filter(Boolean);
  if (!clean.length) return null;
  // La cinta se desliza ligada al scroll con un barrido fijo de -50% del track.
  // Cuantas más copias, más distancia recorre el texto por unidad de scroll →
  // más rápida. 6 copias ≈ 3× la velocidad base (2 copias).
  const COPIES = 6;
  const seq = Array.from({ length: COPIES }, () => clean).flat();

  return (
    <div
      className={`${styles.marquee} ${tone === "dark" ? styles.dark : ""}`}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {seq.map((it, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.star}>✦</span>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
