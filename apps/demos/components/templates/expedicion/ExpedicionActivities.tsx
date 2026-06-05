import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
import ExpedicionTiltCard from "./ExpedicionTiltCard";
import styles from "./ExpedicionActivities.module.css";

type Header = DemoSite["servicesSection"];
type Activities = DemoSite["services"];

export default function ExpedicionActivities({
  header,
  activities,
  locale,
}: {
  header: Header;
  activities: Activities;
  locale: Locale;
}) {
  const es = locale === "es";
  return (
    <section id="actividades" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.kicker}>
            {header?.kicker ?? (es ? "Qué hacemos" : "What we do")}
          </p>
          {header?.title && <h2 className={styles.title}>{header.title}</h2>}
          {header?.lead && <p className={styles.lead}>{header.lead}</p>}
        </header>

        <ul className={styles.grid}>
          {activities.map((act, i) => (
            <ExpedicionTiltCard key={i} className={styles.card}>
              {act.image && (
                <div className={styles.media}>
                  <Image
                    src={urlFor(act.image).width(720).height(520).fit("crop").url()}
                    alt={act.title ?? ""}
                    fill
                    sizes="(max-width: 880px) 100vw, 420px"
                    className={styles.mediaImg}
                  />
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.num}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {act.icon && (
                    <span className={styles.icon} aria-hidden="true">
                      {act.icon}
                    </span>
                  )}
                </div>
                {act.title && <h3 className={styles.cardTitle}>{act.title}</h3>}
                {act.description && (
                  <p className={styles.cardText}>{act.description}</p>
                )}
                {(act.duration || act.price) && (
                  <div className={styles.meta}>
                    {act.duration && (
                      <span className={styles.metaItem}>
                        <span className={styles.metaLabel}>
                          {es ? "Duración" : "Duration"}
                        </span>
                        {act.duration}
                      </span>
                    )}
                    {act.price && (
                      <span className={styles.metaItem}>
                        <span className={styles.metaLabel}>
                          {es ? "Desde" : "From"}
                        </span>
                        {act.price}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </ExpedicionTiltCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
