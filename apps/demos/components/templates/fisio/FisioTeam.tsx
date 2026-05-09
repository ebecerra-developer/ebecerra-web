import Image from "next/image";
import type {
  DemoSectionHeader,
  DemoTeamMember,
} from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./FisioTeam.module.css";

export default function FisioTeam({
  header,
  team,
}: {
  header: DemoSectionHeader | null;
  team: DemoTeamMember[];
}) {
  const eyebrowText = header?.kicker?.replace(/^\/\/\s*/, "");

  return (
    <section
      id="equipo"
      className={styles.section}
      aria-labelledby="team-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {eyebrowText && (
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{eyebrowText}</span>
              <span className={styles.eyebrowLine} />
            </p>
          )}
          {header?.title && (
            <h2 id="team-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {team.map((member, i) => {
            const photoUrl = member.photo
              ? urlFor(member.photo).width(720).auto("format").url()
              : null;
            const initial = member.name.charAt(0).toUpperCase();
            return (
              <li key={i} className={styles.member}>
                <div className={styles.photoWrap}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="(min-width: 1100px) 380px, (min-width: 700px) 50vw, 100vw"
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>{initial}</div>
                  )}
                </div>
                <div className={styles.body}>
                  {member.role && <p className={styles.role}>{member.role}</p>}
                  <h3 className={styles.name}>{member.name}</h3>
                  {member.bio && <p className={styles.bio}>{member.bio}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
