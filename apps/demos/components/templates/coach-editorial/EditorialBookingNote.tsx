import type { DemoSite } from "@ebecerra/sanity-client";
import styles from "./EditorialBookingNote.module.css";

/**
 * Bloque "agenda" editorial — sobrio, sin calendario interactivo. Texto
 * explicando cómo funciona la sesión + CTA a contacto/booking externo
 * si está configurado.
 */
export default function EditorialBookingNote({ demo }: { demo: DemoSite }) {
  const bookingUrl = demo.contact?.bookingUrl ?? null;
  const responseTime = demo.contact?.lead ?? null;
  const note = demo.tagline ?? null;
  if (!bookingUrl && !note) return null;

  return (
    <section className={styles.section} aria-label="Agenda">
      <div className={styles.inner}>
        <p className={styles.label}>
          <span className={styles.labelLine} />
          <span>Cómo agendamos</span>
        </p>
        <p className={styles.text}>
          La primera sesión es una conversación de 30 minutos sin compromiso para
          ver si encajamos. Si seguimos, planificamos juntas el plan a tu medida.
        </p>
        {bookingUrl ? (
          <a
            href={bookingUrl}
            className={styles.cta}
            target="_blank"
            rel="noopener noreferrer"
          >
            Reservar en agenda
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <a href="#contacto" className={styles.cta}>
            Escribirme directamente
            <span aria-hidden="true">→</span>
          </a>
        )}
        {responseTime && (
          <p className={styles.note}>{responseTime}</p>
        )}
      </div>
    </section>
  );
}
