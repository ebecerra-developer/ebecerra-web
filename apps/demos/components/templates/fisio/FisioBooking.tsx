import styles from "./FisioBooking.module.css";

const DAYS = [
  {
    label: "Mañana",
    date: "Mar 14",
    weekday: "Martes",
    slots: [
      { time: "09:00", busy: false },
      { time: "10:00", busy: true },
      { time: "11:00", busy: false },
      { time: "16:00", busy: false },
      { time: "17:30", busy: true },
      { time: "19:00", busy: false },
    ],
  },
  {
    label: "Pasado",
    date: "Mié 15",
    weekday: "Miércoles",
    slots: [
      { time: "08:30", busy: false },
      { time: "10:00", busy: false },
      { time: "11:30", busy: true },
      { time: "16:30", busy: false },
      { time: "18:00", busy: false },
      { time: "20:00", busy: true },
    ],
  },
  {
    label: "Jueves",
    date: "Jue 16",
    weekday: "Jueves",
    slots: [
      { time: "09:30", busy: true },
      { time: "11:00", busy: false },
      { time: "13:00", busy: false },
      { time: "17:00", busy: false },
      { time: "18:30", busy: true },
      { time: "20:00", busy: false },
    ],
  },
  {
    label: "Viernes",
    date: "Vie 17",
    weekday: "Viernes",
    slots: [
      { time: "08:00", busy: false },
      { time: "10:30", busy: false },
      { time: "12:00", busy: false },
      { time: "16:00", busy: true },
      { time: "17:30", busy: false },
      { time: "19:00", busy: false },
    ],
  },
];

export default function FisioBooking() {
  return (
    <section className={styles.section} aria-labelledby="booking-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            <span>Reserva online</span>
            <span className={styles.eyebrowLine} />
          </p>
          <h2 id="booking-heading" className={styles.title}>
            Próximas citas disponibles
          </h2>
          <p className={styles.lead}>
            Elige el hueco que mejor te encaje. Confirmas con un clic, recibes
            recordatorio por SMS y WhatsApp.
          </p>
        </header>

        <div className={styles.calendar}>
          <div className={styles.days}>
            {DAYS.map((day) => (
              <div key={day.date} className={styles.day}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayLabel}>{day.weekday}</span>
                  <span className={styles.dayDate}>{day.date}</span>
                </div>
                <ul className={styles.slots}>
                  {day.slots.map((slot) => (
                    <li key={slot.time}>
                      <a
                        href={slot.busy ? undefined : "#contacto"}
                        className={
                          slot.busy
                            ? `${styles.slot} ${styles.slotBusy}`
                            : styles.slot
                        }
                        aria-disabled={slot.busy}
                        tabIndex={slot.busy ? -1 : 0}
                      >
                        {slot.time}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={styles.legend} role="presentation">
            <span className={styles.legendItem}>
              <span
                className={`${styles.legendDot} ${styles.legendDotFree}`}
                aria-hidden="true"
              />
              Disponible
            </span>
            <span className={styles.legendItem}>
              <span
                className={`${styles.legendDot} ${styles.legendDotBusy}`}
                aria-hidden="true"
              />
              Ocupado
            </span>
          </div>
        </div>

        <p className={styles.note}>
          ¿Prefieres otro día o necesitas una franja distinta?{" "}
          <a href="#contacto">Escríbenos</a> y te encajamos.
        </p>
      </div>
    </section>
  );
}
