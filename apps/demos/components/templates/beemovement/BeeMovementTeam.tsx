import type { DemoSectionHeader, DemoTeamMember } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import { Link } from "@/i18n/navigation";
import BeeMovementTeamPhoto from "./BeeMovementTeamPhoto";
import styles from "./BeeMovementTeam.module.css";

export default function BeeMovementTeam({
  header,
  team,
  slug,
}: {
  header: DemoSectionHeader | null;
  team: DemoTeamMember[];
  slug: string;
}) {
  return (
    <section id="equipo" className={styles.section} aria-labelledby="team-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          {header?.kicker && <p className={styles.eyebrow}>{header.kicker}</p>}
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
            const hoverPhotoUrl = member.hoverPhoto
              ? urlFor(member.hoverPhoto).width(720).auto("format").url()
              : null;
            const initial = member.name.charAt(0).toUpperCase();
            return (
              <li key={i} className={styles.member}>
                <BeeMovementTeamPhoto
                  photoUrl={photoUrl}
                  hoverPhotoUrl={hoverPhotoUrl}
                  alt={member.name}
                  initial={initial}
                />
                <div className={styles.body}>
                  {member.role && <p className={styles.role}>{member.role}</p>}
                  <h3 className={styles.name}>{member.name}</h3>
                </div>
              </li>
            );
          })}
        </ul>

        <Link href={`/${slug}/equipo`} className={styles.moreLink}>
          Conoce al equipo en detalle →
        </Link>
      </div>
    </section>
  );
}
