import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import { urlFor } from "@/lib/image";
import ExpedicionTiltCard from "./ExpedicionTiltCard";
import styles from "./ExpedicionGuides.module.css";

type Header = DemoSite["teamSection"];
type Team = DemoSite["team"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ExpedicionGuides({
  header,
  team,
}: {
  header: Header;
  team: Team;
}) {
  return (
    <section id="guias" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          {header?.kicker && <p className={styles.kicker}>{header.kicker}</p>}
          {header?.title && <h2 className={styles.title}>{header.title}</h2>}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {team.map((g, i) => (
            <ExpedicionTiltCard key={i} className={styles.card}>
              <div className={styles.avatar}>
                {g.photo ? (
                  <Image
                    src={urlFor(g.photo).width(360).height(360).fit("crop").url()}
                    alt={g.name}
                    fill
                    sizes="120px"
                    className={styles.avatarImg}
                  />
                ) : (
                  <span className={styles.initials} aria-hidden="true">
                    {initials(g.name)}
                  </span>
                )}
              </div>
              <p className={styles.name}>{g.name}</p>
              {g.role && <p className={styles.role}>{g.role}</p>}
              {g.bio && <p className={styles.bio}>{g.bio}</p>}
            </ExpedicionTiltCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
