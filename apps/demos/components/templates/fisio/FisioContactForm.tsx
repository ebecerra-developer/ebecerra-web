"use client";

import { useState, type FormEvent } from "react";
import styles from "./FisioContactForm.module.css";

type Status = "idle" | "submitting" | "success";

export default function FisioContactForm({
  serviceOptions,
}: {
  serviceOptions: string[];
}) {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Demo: simulación de envío. En una web real, aquí va una server action
    // o fetch a /api/contact con Resend/SES.
    setTimeout(() => setStatus("success"), 700);
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <div className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.successTitle}>¡Mensaje recibido!</p>
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
        <h3 className={styles.formTitle}>Pide tu primera valoración</h3>
        <p className={styles.formLead}>
          Cuéntanos qué te pasa. Te llamamos en menos de 24 horas para
          ayudarte a elegir la sesión que necesitas.
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

      {serviceOptions.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-service">
            ¿Qué te interesa?
          </label>
          <select
            id="cf-service"
            name="service"
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona un servicio
            </option>
            <option value="valoracion">Primera valoración</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="otra">Otra consulta</option>
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">
          Mensaje
        </label>
        <textarea
          id="cf-message"
          name="message"
          className={styles.textarea}
          placeholder="Cuéntanos brevemente qué te pasa o qué necesitas"
        />
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Enviando…" : "Solicitar valoración"}
      </button>

      <p className={styles.note}>
        Al enviar aceptas nuestra política de privacidad. No compartimos tus
        datos con terceros.
      </p>
    </form>
  );
}
