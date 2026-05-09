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
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && <h2 id="team-heading">{header.title}</h2>}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {team.map((member, i) => {
            const photoUrl = member.photo
              ? urlFor(member.photo).width(480).auto("format").url()
              : null;
            return (
              <li key={i} className={styles.member}>
                <div className={styles.photo}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="240px"
                    />
                  ) : null}
                </div>
                <h3 className={styles.name}>{member.name}</h3>
                {member.role && <p className={styles.role}>{member.role}</p>}
                {member.bio && <p className={styles.bio}>{member.bio}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
