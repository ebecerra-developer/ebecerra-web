import type { Feature, ProfileFull } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/sanity-image";
import styles from "./About.module.css";

type Stat = { value: string; label: string };

type Props = {
  features: Feature[];
  profile?: ProfileFull | null;
};

// Todo el copy de la sección viene de Sanity (profile). El editor controla
// kicker (incluyendo el "// 02." si lo quiere), title, bio1, bio2, stats, foto
// y el CTA. Sin numbering hardcoded en JSX.
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

  const photo = profile?.aboutPhoto;
  const photoSrc = photo
    ? {
        src: urlFor(photo).width(640).auto("format").url(),
        srcSet: [320, 480, 640, 960]
          .map((w) => `${urlFor(photo).width(w).auto("format").url()} ${w}w`)
          .join(", "),
        alt: photo.alt ?? profile?.name ?? "Enrique Becerra",
      }
    : null;

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

        {/* Panel verde de contraste — el momento firma de la home: foto + cifras */}
        <div className={styles.contrastPanel}>
          <span aria-hidden="true" className={styles.panelCircle} />
          {photoSrc && (
            <div className={styles.photoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoSrc.src}
                srcSet={photoSrc.srcSet}
                sizes="(min-width: 768px) 280px, 60vw"
                alt={photoSrc.alt}
                loading="lazy"
                decoding="async"
                width={640}
                height={853}
                className={styles.photo}
              />
            </div>
          )}
          <div className={styles.bigStats}>
            {stats.map((s, i) => (
              <div key={`${s.label}-${i}`} className={styles.bigStat}>
                <div className={styles.bigStatValue}>{s.value}</div>
                <div className={styles.bigStatLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.split}>
          <div className={styles.bio}>
            {bio1 && <p className={styles.bioPara}>{bio1}</p>}
            {bio2 && <p className={styles.bioParaLast}>{bio2}</p>}

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
