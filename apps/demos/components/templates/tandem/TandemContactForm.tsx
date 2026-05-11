"use client";

import { useState, type FormEvent } from "react";
import styles from "./TandemContactForm.module.css";

type Status = "idle" | "submitting" | "success";

export default function TandemContactForm({
  serviceOptions,
}: {
  serviceOptions: string[];
}) {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 700);
  }

  if (status === "success") {
    return (
      <div className={styles.formCard}>
        <div className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">✓</span>
          <p className={styles.successTitle}>¡Recibido!</p>
          <p className={styles.successText}>
            Te contestamos en menos de 24 h laborables con un par de
            preguntas para entender bien tu caso.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Cuéntanos qué necesitas</h3>
        <p className={styles.formLead}>
          Rellena lo justo. Si nos encaja, te llamamos. Si no, te decimos por
          qué con honestidad.
        </p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">
            Nombre <span className={styles.required}>*</span>
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
          <label className={styles.label} htmlFor="cf-business">
            Negocio
          </label>
          <input
            id="cf-business"
            name="business"
            type="text"
            autoComplete="organization"
            className={styles.input}
            placeholder="Tu marca o empresa"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-email">
          Email <span className={styles.required}>*</span>
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
            <option value="" disabled>Elige una opción</option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
            <option value="otra">Aún no lo tengo claro</option>
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
          placeholder="Cuéntanos tu negocio en dos líneas y qué te ronda la cabeza."
        />
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Enviando…" : "Enviar mensaje →"}
      </button>

      <p className={styles.note}>
        Demo: el envío es simulado. En tu web real conectamos formulario con
        email + CRM.
      </p>
    </form>
  );
}
