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
  const seq = [...clean, ...clean];

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
