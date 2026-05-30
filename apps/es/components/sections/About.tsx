import type { Feature, ProfileFull } from "@ebecerra/sanity-client";
import styles from "./About.module.css";

type Stat = { value: string; label: string };

type Props = {
  features: Feature[];
  profile?: ProfileFull | null;
};

// Todo el copy de la sección viene de Sanity (profile). El editor controla
// kicker (incluyendo el "// 02." si lo quiere), title, bio1, bio2, stats y
// el CTA. Sin numbering hardcoded en JSX.
export default function About({ features, profile }: Props) {
  const kicker = profile?.aboutKicker ?? "// 02. Sobre mí";
  const title = profile?.aboutTitle ?? "Hola, soy Enrique Becerra";
  const bio1 = profile?.bio1 ?? "";
  const bio2 = profile?.bio2 ?? "";
  const viewProfile = profile?.aboutViewProfileCta ?? "Ver perfil completo";
  const stats: Stat[] = profile?.stats?.length
    ? profile.stats
    : [
        { value: "8+", label: "años de oficio" },
        { value: "13", label: "proyectos entregados" },
        { value: "6", label: "proyectos AAPP" },
      ];

  return (
    <section
      id="sobre-mi"
      aria-labelledby="about-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.kicker}>{kicker}</div>
        <h2 id="about-heading" className={styles.heading}>
          {title}
        </h2>

        <div className={styles.split}>
          <div className={styles.bio}>
            {bio1 && <p className={styles.bioPara}>{bio1}</p>}
            {bio2 && <p className={styles.bioParaLast}>{bio2}</p>}

            <div
              className={styles.stats}
              style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
            >
              {stats.map((s, i) => (
                <div
                  key={`${s.label}-${i}`}
                  className={i > 0 ? styles.statItemBordered : styles.statItem}
                >
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            <a href="#contacto" className={`link-accent ${styles.viewProfileLink}`}>
              {viewProfile} →
            </a>
          </div>

          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <div key={`${feature.label}-${i}`} className={styles.featureCard}>
                <span className={styles.featureIndex}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className={styles.featureLabel}>{feature.label}</div>
                  <div className={styles.featureDesc}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
