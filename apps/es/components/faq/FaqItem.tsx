import styles from "./FaqItem.module.css";

type Props = {
  question: string;
  answer: string;
};

export default function FaqItem({ question, answer }: Props) {
  return (
    <li className={styles.item}>
      <details className={styles.details}>
        <summary className={styles.summary}>
          <span>{question}</span>
          <span aria-hidden className={styles.icon}>
            +
          </span>
        </summary>
        <div className={styles.answer}>{answer}</div>
      </details>
    </li>
  );
}
