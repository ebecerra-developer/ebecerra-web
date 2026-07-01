import Image from "next/image";
import type { DemoSite } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import { urlFor } from "@/lib/image";
import FisioNavMobile from "../fisio/FisioNavMobile";
import BeeMovementNavLinks from "./BeeMovementNavLinks";
import styles from "./BeeMovementNav.module.css";

export default function BeeMovementNav({
  demo,
  home = true,
}: {
  demo: DemoSite;
  locale: Locale;
  /** true en la home (anclas locales); false en subpáginas (anclas a la home). */
  home?: boolean;
}) {
  const logoUrl = demo.brand?.logo
    ? urlFor(demo.brand.logo).height(80).auto("format").url()
    : null;
  const whatsapp = demo.contact?.social.find((s) => s.name === "WhatsApp");
  const homePath = `/${demo.slug}`;
  const anchor = (id: string) => (home ? `#${id}` : `${homePath}#${id}`);

  const items: { href: string; label: string }[] = [];
  if (demo.about) items.push({ href: anchor("sobre"), label: "Sobre nosotros" });
  if (demo.lifestyleGallery.length > 0)
    items.push({ href: anchor("espacio"), label: "El espacio" });
  if (demo.services.length > 0)
    items.push({ href: anchor("servicios"), label: "Servicios" });
  items.push({ href: anchor("citas"), label: "Citas" });
  if (demo.team.length > 0)
    items.push({ href: `${homePath}/equipo`, label: "Equipo" });
  items.push({ href: anchor("contacto"), label: "Contacto" });

  const brandNode = (
    <>
      {logoUrl && (
        <Image
          src={logoUrl}
          alt=""
          height={22}
          width={27}
          className={styles.brandMark}
          priority
        />
      )}
      Espacio BeeMovement
    </>
  );

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <a
          href={home ? "#main" : homePath}
          className={styles.brand}
          aria-label="Ir al inicio"
        >
          {brandNode}
        </a>

        <nav aria-label="Navegación principal" className={styles.desktopNav}>
          <BeeMovementNavLinks items={items} />
        </nav>

        <div className={styles.right}>
          {whatsapp?.url && (
            <a
              href={whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.navWhatsapp}
              aria-label="Escribir por WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.478 2 2 6.478 2 12.004c0 1.86.51 3.677 1.475 5.263L2 22l4.865-1.446a10.03 10.03 0 0 0 5.139 1.412h.004c5.526 0 10.004-4.478 10.004-10.004C22 6.478 17.53 2 12.004 2zm0 18.166a8.14 8.14 0 0 1-4.163-1.14l-.298-.177-2.888.858.865-2.816-.194-.29a8.15 8.15 0 0 1-1.264-4.363c0-4.51 3.669-8.18 8.18-8.18a8.13 8.13 0 0 1 5.786 2.397 8.13 8.13 0 0 1 2.393 5.786c0 4.512-3.669 8.18-8.417 8.18z" />
              </svg>
            </a>
          )}
          <a href={anchor("citas")} className={styles.cta}>
            Pedir cita
          </a>
          <FisioNavMobile
            brand={brandNode}
            items={items}
            ctaLabel="Pedir cita"
            ctaHref={anchor("citas")}
            ariaOpen="Abrir menú"
            ariaClose="Cerrar menú"
            ariaPrimaryNav="Navegación principal"
            templateScope="beemovement"
            secondaryHref={whatsapp?.url ?? undefined}
            secondaryLabel="Escribir por WhatsApp"
          />
        </div>
      </div>
    </header>
  );
}
