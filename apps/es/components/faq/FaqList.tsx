import FaqItem from "./FaqItem";
import styles from "./FaqList.module.css";

type Props = {
  items: { q: string; a: string }[];
};

export default function FaqList({ items }: Props) {
  return (
    <ul className={styles.list}>
      {items.map((item, idx) => (
        <FaqItem key={idx} question={item.q} answer={item.a} />
      ))}
    </ul>
  );
}
