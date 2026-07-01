import Image from "next/image";
import type { DemoSite, DemoTeamMember } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
import BeeMovementNav from "./BeeMovementNav";
import BeeMovementFooter from "./BeeMovementFooter";
import BeeMovementWhatsappFloat from "./BeeMovementWhatsappFloat";
import { TEAM_CONTENT, type TeamMemberKey } from "./team-content";
import styles from "./BeeMovementEquipoPage.module.css";

const KEYS: TeamMemberKey[] = ["alejandra", "sonia", "paula"];

export default function BeeMovementEquipoPage({
  demo,
  locale,
}: {
  demo: DemoSite;
  locale: Locale;
}) {
  const whatsapp = demo.contact?.social.find((s) => s.name === "WhatsApp");

  return (
    <div className={styles.shell} data-template="beemovement">
      <BeeMovementNav demo={demo} locale={locale} home={false} />
      <main id="main">
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <nav className={styles.breadcrumb} aria-label="breadcrumb">
              <a href={`/${demo.slug}`}>Inicio</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Equipo</span>
            </nav>
            <h1 className={styles.title}>El equipo de Espacio BeeMovement</h1>
            <p className={styles.lead}>
              Fisioterapia y nutrición bajo el mismo techo, en Moratalaz.
              Conoce quién te va a tratar y en qué se ha especializado cada
              una.
            </p>
          </div>
        </header>

        <div className={styles.list}>
          {demo.team.map((member: DemoTeamMember, i) => {
            const key = KEYS[i];
            const content = key ? TEAM_CONTENT[key] : null;
            const photoUrl = member.photo
              ? urlFor(member.photo).width(900).auto("format").url()
              : null;
            const reversed = i % 2 === 1;
            return (
              <section
                key={i}
                className={`${styles.member} ${reversed ? styles.memberReversed : ""}`}
                aria-labelledby={`member-${i}-name`}
              >
                <div className={styles.photoWrap}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={member.name}
                      fill
                      sizes="(min-width: 900px) 420px, 100vw"
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={styles.body}>
                  {member.role && <p className={styles.role}>{member.role}</p>}
                  <h2 id={`member-${i}-name`} className={styles.name}>
                    {member.name}
                  </h2>
                  <p className={styles.intro}>
                    {content?.intro ?? member.bio}
                  </p>
                  {content?.focus && content.focus.length > 0 && (
                    <ul className={styles.focusList}>
                      {content.focus.map((f) => (
                        <li key={f} className={styles.focusItem}>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <section className={styles.cta} aria-labelledby="cta-h">
          <h2 id="cta-h" className={styles.ctaTitle}>
            ¿Con quién te encaja hablar primero?
          </h2>
          <p className={styles.ctaBody}>
            Si no lo tienes claro, escríbenos y te orientamos antes de
            reservar.
          </p>
          <div className={styles.ctaActions}>
            <a href={`/${demo.slug}#citas`} className={styles.ctaPrimary}>
              Pedir cita
            </a>
            {whatsapp?.url && (
              <a
                href={whatsapp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                Escribir por WhatsApp
              </a>
            )}
          </div>
        </section>
      </main>
      <BeeMovementFooter demo={demo} home={false} />
      {whatsapp?.url && <BeeMovementWhatsappFloat href={whatsapp.url} />}
    </div>
  );
}
