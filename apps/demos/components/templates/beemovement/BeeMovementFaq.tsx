import styles from "./BeeMovementFaq.module.css";

/**
 * Preguntas frecuentes reales antes de reservar — la ausencia más señalada
 * en el análisis de confianza: sin esto, quien busca fisio de suelo
 * pélvico o una lesión deportiva llega con dudas que nadie resuelve.
 * Respuestas honestas, sin inventar datos que no tenemos (precios exactos,
 * aseguradoras concretas, duraciones exactas de sesión).
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "¿Necesito volante médico para pedir cita?",
    a: "No. Puedes reservar directamente, sin volante ni derivación previa.",
  },
  {
    q: "¿Qué pasa en la primera visita?",
    a: "Empezamos con una valoración completa antes de tocar nada: de dónde viene la molestia, qué esperas conseguir, y a partir de ahí armamos el plan de tratamiento contigo.",
  },
  {
    q: "¿Tratáis la recuperación después del parto?",
    a: "Sí — la unidad de suelo pélvico está pensada precisamente para embarazo, postparto y disfunciones de suelo pélvico.",
  },
  {
    q: "¿Está colegiado el equipo?",
    a: "Sí, todo el equipo está colegiado y con formación reglada específica en sus áreas.",
  },
  {
    q: "¿Puedo escribir antes de reservar si tengo dudas?",
    a: "Claro — el botón de WhatsApp está siempre visible en la web para eso mismo.",
  },
  {
    q: "¿Qué hago si no puedo asistir a mi cita?",
    a: "Avísanos con antelación por WhatsApp o llamando, y te buscamos otro hueco sin problema.",
  },
];

export default function BeeMovementFaq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Antes de reservar</p>
          <h2 id="faq-heading" className={styles.title}>
            Preguntas frecuentes
          </h2>
        </header>

        <div className={styles.list}>
          {FAQS.map((item, i) => (
            <details key={i} className={styles.item}>
              <summary className={styles.question}>
                {item.q}
                <span className={styles.chevron} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
