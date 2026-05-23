"use client";

import { useState, type FormEvent } from "react";
import styles from "./FisioContactForm.module.css";

type Status = "idle" | "submitting" | "success";

/**
 * Formulario de consultas — NO de reserva.
 *
 * Para reservar, el visitante usa el widget de reservas (FisioBooking) que vive
 * más arriba en la página. Este form cubre casos que el flujo automático no
 * resuelve: mutuas, casos especiales, fuera de horario, dudas previas.
 */
export default function FisioContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Demo: simulación de envío. En una web real iría a /api/contact (Resend/SES).
    setTimeout(() => setStatus("success"), 700);
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <div className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.successTitle}>¡Consulta recibida!</p>
          <p className={styles.successText}>
            Te contestamos en menos de 24 horas laborables. Si tu caso es
            urgente, llámanos directamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Pregúntanos antes de reservar</h3>
        <p className={styles.formLead}>
          ¿Tienes dudas sobre qué sesión te encaja, llevas mutua, o necesitas
          algo fuera de los huecos del calendario? Cuéntanoslo y te ayudamos.
        </p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">
            Nombre<span className={styles.required}>*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            placeholder="Tu nombre"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-phone">
            Teléfono<span className={styles.required}>*</span>
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={styles.input}
            placeholder="600 00 00 00"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-email">
          Email<span className={styles.required}>*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={styles.input}
          placeholder="tu@email.com"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-topic">
          Sobre qué quieres preguntar
        </label>
        <select
          id="cf-topic"
          name="topic"
          className={styles.select}
          defaultValue=""
        >
          <option value="" disabled>
            Elige el motivo
          </option>
          <option value="mutua">Mutua o seguro privado</option>
          <option value="caso-especial">Caso clínico especial</option>
          <option value="duda-servicio">No sé qué sesión necesito</option>
          <option value="fuera-horario">Horario fuera del calendario</option>
          <option value="grupo">Grupo / familia / empresa</option>
          <option value="otra">Otra cosa</option>
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">
          Tu consulta<span className={styles.required}>*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          className={styles.textarea}
          placeholder="Cuéntanos brevemente qué necesitas"
        />
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Enviando…" : "Enviar consulta"}
      </button>

      <p className={styles.note}>
        Al enviar aceptas nuestra política de privacidad. No compartimos tus
        datos con terceros.
      </p>
    </form>
  );
}
