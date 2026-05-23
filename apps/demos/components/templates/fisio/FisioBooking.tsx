"use client";

import { BookingFlow } from "@ebecerra/bookings/widget";
import styles from "./FisioBooking.module.css";

/**
 * Sección "Reserva online" de la plantilla fisio.
 *
 * En vez de un calendario mockeado, embebemos el widget real de @ebecerra/bookings
 * conectado al tenant demo-equilibrio (apps/es). Disponibilidad y reservas reales
 * para que el visitante de la demo pueda probar el flujo de principio a fin.
 *
 * Env vars necesarias (apps/demos):
 *   NEXT_PUBLIC_BOOKINGS_API_BASE = https://bookings.ebecerra.es
 *   NEXT_PUBLIC_BOOKING_TENANT_KEY_DEMO_FISIO = <btk_…>
 */
export default function FisioBooking() {
  const apiBase = process.env.NEXT_PUBLIC_BOOKINGS_API_BASE ?? "";
  const tenantKey = process.env.NEXT_PUBLIC_BOOKING_TENANT_KEY_DEMO_FISIO ?? "";
  const configured = apiBase && tenantKey;

  return (
    <section className={styles.section} aria-labelledby="booking-heading" id="reservas">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span>Reserva online</span>
            <span className={styles.eyebrowLine} />
          </p>
          <h2 id="booking-heading" className={styles.title}>
            Reserva tu sesión
          </h2>
          <p className={styles.lead}>
            Elige el servicio, mira huecos en tiempo real, reserva con tu email
            y confirma con un clic.
          </p>
        </header>

        <div className={styles.widgetWrap}>
          {configured ? (
            <BookingFlow
              apiBase={apiBase}
              tenantKey={tenantKey}
              locale="es"
              accentColor="var(--cta)"
            />
          ) : (
            <p className={styles.note}>
              Configura <code>NEXT_PUBLIC_BOOKING_TENANT_KEY_DEMO_FISIO</code> y
              <code> NEXT_PUBLIC_BOOKINGS_API_BASE</code> en Vercel para activar el widget.
            </p>
          )}
        </div>

        <p className={styles.note}>
          ¿Prefieres llamar? Estamos en <strong>+34 600 000 000</strong> · L-V 9-20h
        </p>
      </div>
    </section>
  );
}
