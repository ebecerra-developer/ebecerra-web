import styles from "./GestoriaFaq.module.css";

type FaqItem = { q: string; a: string };

/**
 * FAQ de dudas reales (incluye el traspaso desde el gestor actual, la mayor
 * fricción del sector). Acordeón con <details>/<summary> nativo: accesible y sin
 * JS. Reutilizable en home (id="faq") y en subpáginas (con su propio título).
 */
export default function GestoriaFaq({
  kicker,
  title,
  lead,
  items,
  id = "faq",
  variant = "section",
}: {
  kicker?: string;
  title: string;
  lead?: string;
  items: FaqItem[];
  id?: string;
  variant?: "section" | "plain";
}) {
  const inner = (
    <>
      {variant === "section" ? (
        <header className={styles.head}>
          {kicker && (
            <p className={styles.kicker}>
              <span className={styles.kickerMark} aria-hidden="true" />
              {kicker}
            </p>
          )}
          <h2 className={styles.title}>{title}</h2>
          {lead && <p className={styles.lead}>{lead}</p>}
        </header>
      ) : (
        <h3 className={styles.titlePlain}>{title}</h3>
      )}

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.q} className={styles.item}>
            <details className={styles.details}>
              <summary className={styles.summary}>
                <span>{item.q}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </summary>
              <div className={styles.answer}>
                <p>{item.a}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  );

  if (variant === "plain") {
    return <div className={styles.plainWrap}>{inner}</div>;
  }

  return (
    <section id={id} className={styles.section} aria-label={title}>
      <div className={styles.inner}>{inner}</div>
    </section>
  );
}
