import styles from "./Kicker.module.css";

type Props = {
  children?: string | null;
  tone?: "light" | "dark" | "accent";
};

// Kicker de sección con estrella ✦ (sin numeración). El texto viene de Sanity;
// si trae el viejo prefijo "// 02." se limpia para mostrar solo el nombre.
// tone: light (sobre crema) · dark (sobre banda oscura) · accent (sobre verde).
export default function Kicker({ children, tone = "light" }: Props) {
  const text = (children ?? "").replace(/^\/\/\s*[\d.]*\s*/, "").trim();
  if (!text) return null;

  const toneClass =
    tone === "dark" ? styles.dark : tone === "accent" ? styles.accent : "";

  return (
    <div className={`${styles.kicker} ${toneClass}`}>
      <span className={styles.star} aria-hidden="true">
        ✦
      </span>
      <span className={styles.text}>{text}</span>
    </div>
  );
}
