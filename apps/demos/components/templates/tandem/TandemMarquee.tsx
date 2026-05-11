import styles from "./TandemMarquee.module.css";

const ITEMS = [
  "estrategia con cabeza",
  "contenido que no da vergüenza",
  "campañas que vuelven en €",
  "webs que tu cliente recuerda",
  "SEO sin trucos raros",
  "comunidad de verdad",
];

const STAR = "✺";

export default function TandemMarquee() {
  // Duplicado para loop infinito sin parón
  const seq = [...ITEMS, ...ITEMS];

  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={styles.track}>
        {seq.map((text, i) => (
          <span key={i} className={styles.item}>
            <span className={styles.text}>{text}</span>
            <span className={styles.star}>{STAR}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
