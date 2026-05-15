import styles from "./BlogIntro.module.css";

type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export default function BlogIntro({ kicker, title, lead }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.kicker}>{kicker}</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={`lead ${styles.lead}`}>{lead}</p>
    </header>
  );
}
