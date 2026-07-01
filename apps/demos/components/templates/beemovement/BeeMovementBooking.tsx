"use client";

import { BookingFlow } from "@ebecerra/bookings/widget";
import styles from "./BeeMovementBooking.module.css";

/**
 * Sección "Citas" — reutiliza el mismo widget real de @ebecerra/bookings
 * que la demo Equilibrio (más pulido que un mock estático), conectado al
 * mismo tenant demo. Sin mencionar Gestiona/Klinikare: no está confirmado
 * todavía que sea el software que usa la clínica.
 *
 * Env vars necesarias (apps/demos), iguales que FisioBooking:
 *   NEXT_PUBLIC_BOOKINGS_API_BASE
 *   NEXT_PUBLIC_BOOKING_TENANT_KEY_DEMO_FISIO
 */
export default function BeeMovementBooking() {
  const apiBase = process.env.NEXT_PUBLIC_BOOKINGS_API_BASE ?? "";
  const tenantKey = process.env.NEXT_PUBLIC_BOOKING_TENANT_KEY_DEMO_FISIO ?? "";
  const configured = apiBase && tenantKey;

  return (
    <section className={styles.section} aria-labelledby="booking-heading" id="citas">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Reserva fácil</p>
          <h2 id="booking-heading" className={styles.title}>
            Pide tu cita en segundos
          </h2>
          <p className={styles.lead}>
            Elige día y hora sin llamar. Así de fácil se vería conectado a tu
            propio sistema de citas.
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
          ¿Prefieres llamar? Esto se suma a como trabajas hoy, no lo sustituye.
        </p>
      </div>
    </section>
  );
}
