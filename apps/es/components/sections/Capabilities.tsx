import { getTranslations } from "next-intl/server";
import styles from "./Capabilities.module.css";

type Cap = {
  key: string;
  icon: string;
  badge?: string;
  featured?: boolean;
  titleKey: string;
  descKey: string;
  bulletKeys: string[];
};

const CAPS: Cap[] = [
  {
    key: "ai",
    icon: "🤖",
    badge: "Nuevo",
    featured: true,
    titleKey: "aiTitle",
    descKey: "aiDesc",
    bulletKeys: ["aiB1", "aiB2", "aiB3"],
  },
  {
    key: "booking",
    icon: "📅",
    titleKey: "bookingTitle",
    descKey: "bookingDesc",
    bulletKeys: ["bookB1", "bookB2", "bookB3"],
  },
  {
    key: "integrations",
    icon: "🔌",
    titleKey: "intTitle",
    descKey: "intDesc",
    bulletKeys: ["intB1", "intB2", "intB3"],
  },
  {
    key: "analytics",
    icon: "📊",
    titleKey: "anTitle",
    descKey: "anDesc",
    bulletKeys: ["anB1", "anB2", "anB3"],
  },
];

export default async function Capabilities() {
  const t = await getTranslations("capabilities");

  return (
    <section
      id="capacidades"
      aria-labelledby="capabilities-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.kicker}>
            {"// "}
            <span className={styles.kickerAccent}>03.</span>{" "}
            {t("kicker")}
          </div>
          <h2 id="capabilities-heading" className={styles.heading}>
            {t("title")}
          </h2>
          <p className={`lead ${styles.lead}`}>{t("lead")}</p>
        </header>

        <div className={styles.grid}>
          {CAPS.map((cap) => (
            <article
              key={cap.key}
              className={
                cap.featured ? `${styles.card} ${styles.cardFeatured}` : styles.card
              }
            >
              <div className={styles.iconRow}>
                <span className={styles.icon} aria-hidden="true">
                  {cap.icon}
                </span>
                {cap.badge && <span className={styles.badge}>{cap.badge}</span>}
              </div>
              <h3 className={styles.cardTitle}>{t(cap.titleKey)}</h3>
              <p className={styles.cardDesc}>{t(cap.descKey)}</p>
              <ul className={styles.bullets}>
                {cap.bulletKeys.map((bk) => (
                  <li key={bk} className={styles.bullet}>
                    {t(bk)}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className={styles.note}>
          <span className={styles.noteLabel}>{t("noteLabel")}</span>
          <p className={styles.noteText}>{t("noteText")}</p>
        </div>
      </div>
    </section>
  );
}
