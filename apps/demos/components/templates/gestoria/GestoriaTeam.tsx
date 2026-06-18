import Image from "next/image";
import type { DemoTeamMember } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import type { GestoriaContent } from "./content";
import GestoriaTiltCard from "./GestoriaTiltCard";
import styles from "./GestoriaTeam.module.css";

/**
 * Equipo: el mayor salto de confianza frente a la web fría típica. Personas con
 * nombre y rol en TiltCards (tilt leve al hover, off en táctil). Las fotos son
 * placeholders IA generadas con el MCP de Sanity (como el resto de demos); si
 * por lo que sea falta una, cae a un avatar con iniciales. La copy (área, frase)
 * vive en el contenido local y se empareja por orden con los miembros de Sanity.
 */
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function GestoriaTeam({
  content,
  team,
}: {
  content: GestoriaContent;
  team: DemoTeamMember[];
}) {
  const t = content.team;

  return (
    <section id="equipo" className={styles.section} aria-labelledby="team-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>
            <span className={styles.kickerMark} aria-hidden="true" />
            {t.kicker}
          </p>
          <h2 id="team-heading" className={styles.title}>
            {t.title}
          </h2>
          <p className={styles.lead}>{t.lead}</p>
        </header>

        <ul className={styles.grid}>
          {t.members.map((m, i) => {
            const photo = team[i]?.photo;
            const photoUrl = photo
              ? urlFor(photo).width(720).height(540).fit("crop").auto("format").url()
              : null;
            return (
              <li key={m.name}>
                <GestoriaTiltCard className={styles.card}>
                  <span className={styles.avatar}>
                    {photoUrl ? (
                      <Image
                        src={photoUrl}
                        alt={m.name}
                        fill
                        className={styles.photo}
                        sizes="(min-width: 980px) 280px, (min-width: 560px) 50vw, 100vw"
                      />
                    ) : (
                      <span className={styles.avatarInitials} aria-hidden="true">
                        {initials(m.name)}
                      </span>
                    )}
                  </span>
                  <div className={styles.cardBody}>
                    <h3 className={styles.name}>{m.name}</h3>
                    <p className={styles.role}>{m.role}</p>
                    <span className={styles.areaPill}>{m.area}</span>
                    <p className={styles.note}>“{m.note}”</p>
                  </div>
                </GestoriaTiltCard>
              </li>
            );
          })}
        </ul>

        <p className={styles.photoNote}>{t.photoNote}</p>
      </div>
    </section>
  );
}
