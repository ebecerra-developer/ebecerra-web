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
  return (
    <section
      id="equipo"
      className={styles.section}
      aria-labelledby="team-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            {header?.kicker && (
              <p className={styles.sectionIndex}>
                <span className={styles.indexNumber}>03</span>
                <span>{header.kicker.replace(/^\/\/\s*/, "")}</span>
              </p>
            )}
            {header?.title && (
              <h2 id="team-heading" className={styles.title}>
                {header.title}
              </h2>
            )}
          </div>
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {team.map((member, i) => {
            const photoUrl = member.photo
              ? urlFor(member.photo).width(640).auto("format").url()
              : null;
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
                    <div className={styles.photoPlaceholder}>◯</div>
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
