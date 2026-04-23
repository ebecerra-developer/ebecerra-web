import styles from "./FaqIntro.module.css";

type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export default function FaqIntro({ kicker, title, lead }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.kicker}>
        {kicker.replace(/^\/\/\s*/, "// ")}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={`lead ${styles.lead}`}>{lead}</p>
    </header>
  );
}
