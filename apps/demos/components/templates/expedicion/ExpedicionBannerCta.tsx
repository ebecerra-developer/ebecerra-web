import type { Locale } from "@/i18n/routing";
import styles from "./ExpedicionBannerCta.module.css";

export default function ExpedicionBannerCta({
  businessName,
  locale,
}: {
  businessName: string;
  locale: Locale;
}) {
  const es = locale === "es";
  return (
    <section className={styles.banner} aria-label={es ? "Reserva" : "Booking"}>
      <div className={styles.inner}>
        <p className={styles.kicker}>
          {es ? "Tu próxima ruta" : "Your next route"}
        </p>
        <h2 className={styles.title}>
          {es ? (
            <>
              ¿Listo para salir <span className={styles.hl}>ahí fuera</span>?
            </>
          ) : (
            <>
              Ready for the <span className={styles.hl}>wild</span>?
            </>
          )}
        </h2>
        <p className={styles.sub}>
          {es
            ? `Grupos reducidos, guías titulados y todo el material incluido. ${businessName} te lleva.`
            : `Small groups, certified guides and all gear included. ${businessName} takes you there.`}
        </p>
        <a href="#contacto" className={styles.cta}>
          {es ? "Reservar mi aventura" : "Book my adventure"}
        </a>
      </div>
    </section>
  );
}
