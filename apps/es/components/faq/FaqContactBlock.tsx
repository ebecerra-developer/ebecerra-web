import styles from "./FaqContactBlock.module.css";

type Props = {
  title: string;
  lead: string;
  cta: string;
  href: string;
};

export default function FaqContactBlock({ title, lead, cta, href }: Props) {
  return (
    <section aria-labelledby="faq-contact" className={styles.block}>
      <h2 id="faq-contact" className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>{lead}</p>
      <a href={href} className={styles.cta}>
        {cta} →
      </a>
    </section>
  );
}
