import Image from "next/image";
import type { DemoSectionHeader, DemoTeamMember } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import styles from "./TandemTeam.module.css";

export default function TandemTeam({
  header,
  team,
}: {
  header: DemoSectionHeader | null;
  team: DemoTeamMember[];
}) {
  return (
    <section
      id="nosotras"
      className={styles.section}
      aria-labelledby="team-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && (
            <h2 id="team-heading" className={styles.title}>
              {header.title}
            </h2>
          )}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <div className={styles.grid}>
          {team.map((member, i) => {
            const photoUrl = member.photo
              ? urlFor(member.photo).width(240).height(240).auto("format").url()
              : null;
            return (
            <article
              key={member.name + i}
              className={styles.card}
              data-tone={i % 2 === 0 ? "coral" : "cobalt"}
            >
              <div className={styles.photoWrap} aria-hidden="true">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt=""
                    width={120}
                    height={120}
                    className={styles.photo}
                  />
                ) : (
                  <>
                    <span className={styles.photoPlaceholder}>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className={styles.photoNote}>foto pendiente</span>
                  </>
                )}
              </div>
              <div className={styles.body}>
                <h3 className={styles.name}>{member.name}</h3>
                {member.role && <p className={styles.role}>{member.role}</p>}
                {member.bio && <p className={styles.bio}>{member.bio}</p>}
              </div>
            </article>
          );
          })}
        </div>
      </div>
    </section>
  );
}
