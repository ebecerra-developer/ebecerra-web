import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./BeeMovementFooter.module.css";

export default function BeeMovementFooter({
  demo,
  home = true,
}: {
  demo: DemoSite;
  /** true en la home (anclas locales); false en subpáginas (anclas a la home). */
  home?: boolean;
}) {
  const year = new Date().getFullYear();
  const contact = demo.contact;
  const whatsapp = contact?.social.find((s) => s.name === "WhatsApp");
  const instagram = contact?.social.find((s) => s.name === "Instagram");
  const homePath = `/${demo.slug}`;
  const anchor = (id: string) => (home ? `#${id}` : `${homePath}#${id}`);

  const navLinks: { href: string; label: string }[] = [];
  if (demo.about) navLinks.push({ href: anchor("sobre"), label: "Sobre nosotros" });
  if (demo.lifestyleGallery.length > 0)
    navLinks.push({ href: anchor("espacio"), label: "El espacio" });
  if (demo.services.length > 0)
    navLinks.push({ href: anchor("servicios"), label: "Servicios" });
  navLinks.push({ href: anchor("citas"), label: "Citas" });
  if (demo.team.length > 0)
    navLinks.push({ href: `${homePath}/equipo`, label: "Equipo" });
  navLinks.push({ href: anchor("faq"), label: "Preguntas frecuentes" });
  navLinks.push({ href: anchor("contacto"), label: "Contacto" });

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <p className={styles.brand}>{demo.businessName}</p>
            {demo.tagline && <p className={styles.tagline}>{demo.tagline}</p>}
            {contact?.address && (
              <address className={styles.address}>{contact.address}</address>
            )}
            {contact?.phone && (
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className={styles.link}>
                {contact.phone}
              </a>
            )}
            {contact?.email && (
              <a href={`mailto:${contact.email}`} className={styles.link}>
                {contact.email}
              </a>
            )}
          </div>

          <nav className={styles.col} aria-label="Mapa del sitio">
            <p className={styles.colTitle}>Navegación</p>
            <ul className={styles.linkList}>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className={styles.link}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.col}>
            <p className={styles.colTitle}>Horario</p>
            {contact?.hours.map((row, i) => (
              <p key={i} className={styles.hoursRow}>
                {row.label}
                {row.label && row.value ? " — " : ""}
                {row.value}
              </p>
            ))}
            <div className={styles.social}>
              {whatsapp?.url && (
                <a
                  href={whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  WhatsApp
                </a>
              )}
              {instagram?.url && (
                <a
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} {demo.businessName}</span>
          <span className={styles.demoNote}>
            Demo privada en{" "}
            <a href="https://ebecerra.es" rel="noopener">
              ebecerra.es
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
