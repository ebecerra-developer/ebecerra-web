"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/routing";
import styles from "./ExpedicionContactForm.module.css";

type Status = "idle" | "submitting" | "success";

export default function ExpedicionContactForm({
  serviceOptions,
  bookingUrl,
  locale,
}: {
  serviceOptions: string[];
  bookingUrl: string | null;
  locale: Locale;
}) {
  const es = locale === "es";
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
          <span className={styles.successIcon} aria-hidden="true">
            ✓
          </span>
          <p className={styles.successTitle}>
            {es ? "¡Recibido!" : "Got it!"}
          </p>
          <p className={styles.successText}>
            {es
              ? "Te escribimos en menos de 24 h con fechas disponibles y nivel recomendado."
              : "We'll reply within 24 h with available dates and the recommended level."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.formCard} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>
          {es ? "Reserva o pregunta" : "Book or ask"}
        </h3>
        <p className={styles.formLead}>
          {es
            ? "Cuéntanos qué te apetece y cuántos sois. Te proponemos fecha y nivel."
            : "Tell us what you fancy and how many of you. We'll suggest a date and level."}
        </p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-name">
            {es ? "Nombre" : "Name"} <span className={styles.required}>*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            placeholder={es ? "Tu nombre" : "Your name"}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="cf-people">
            {es ? "Nº de personas" : "Group size"}
          </label>
          <input
            id="cf-people"
            name="people"
            type="number"
            min={1}
            inputMode="numeric"
            className={styles.input}
            placeholder="2"
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
          <label className={styles.label} htmlFor="cf-activity">
            {es ? "¿Qué actividad?" : "Which activity?"}
          </label>
          <select
            id="cf-activity"
            name="activity"
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              {es ? "Elige una opción" : "Choose one"}
            </option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="otra">
              {es ? "Aún no lo tengo claro" : "Not sure yet"}
            </option>
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label} htmlFor="cf-message">
          {es ? "Mensaje" : "Message"}
        </label>
        <textarea
          id="cf-message"
          name="message"
          className={styles.textarea}
          placeholder={
            es
              ? "Fechas que te vienen bien, experiencia previa, lo que quieras contarnos."
              : "Dates that work for you, previous experience, anything else."
          }
        />
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting"
          ? es
            ? "Enviando…"
            : "Sending…"
          : es
            ? "Enviar solicitud →"
            : "Send request →"}
      </button>

      {bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bookingLink}
        >
          {es ? "O reserva online directamente" : "Or book online directly"}
        </a>
      )}

      <p className={styles.note}>
        {es
          ? "Demo: el envío es simulado. En tu web real conectamos el formulario con email + reservas."
          : "Demo: submission is simulated. On your real site we connect the form to email + bookings."}
      </p>
    </form>
  );
}
