"use client";

import { useState, type FormEvent } from "react";
import type { GestoriaContent } from "./content";
import GestoriaIcon from "./GestoriaIcon";
import styles from "./GestoriaContactForm.module.css";

type Status = "idle" | "submitting" | "success";

/**
 * Formulario corto (nombre, teléfono, qué necesita) con casilla de
 * consentimiento RGPD EXPLÍCITA y obligatoria. Demo: el envío se simula (en una
 * web real iría a /api/contact con Resend). Al enviar, check dibujado a mano.
 */
export default function GestoriaContactForm({
  form,
}: {
  form: GestoriaContent["contact"]["form"];
}) {
  const [status, setStatus] = useState<Status>("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Guarda explícita del consentimiento RGPD (no dependemos solo del required
    // nativo, frágil entre navegadores): sin casilla marcada, no se envía.
    const formEl = e.currentTarget;
    const consent = formEl.elements.namedItem("consent") as HTMLInputElement | null;
    if (consent && !consent.checked) {
      consent.reportValidity();
      return;
    }
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 700);
  }

  if (status === "success") {
    return (
      <div className={styles.card}>
        <div className={styles.success}>
          <span className={styles.successIcon} aria-hidden="true">
            <GestoriaIcon name="check" className={styles.successCheck} />
          </span>
          <p className={styles.successTitle}>{form.successTitle}</p>
          <p className={styles.successText}>{form.successBody}</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHead}>
        <h3 className={styles.formTitle}>{form.title}</h3>
        <p className={styles.formLead}>{form.lead}</p>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gf-name">
            {form.name}
            <span className={styles.required} title={form.required}>
              *
            </span>
          </label>
          <input
            id="gf-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={styles.input}
            placeholder={form.namePh}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="gf-phone">
            {form.phone}
            <span className={styles.required} title={form.required}>
              *
            </span>
          </label>
          <input
            id="gf-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={styles.input}
            placeholder={form.phonePh}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="gf-need">
          {form.need}
        </label>
        <select
          id="gf-need"
          name="need"
          className={styles.select}
          defaultValue=""
        >
          <option value="" disabled>
            {form.needPh}
          </option>
          {form.needOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="gf-message">
          {form.message}
        </label>
        <textarea
          id="gf-message"
          name="message"
          rows={4}
          className={styles.textarea}
          placeholder={form.messagePh}
        />
      </div>

      <label className={styles.consent}>
        <input
          type="checkbox"
          name="consent"
          required
          className={styles.checkbox}
        />
        <span className={styles.consentText}>
          {form.consent}{" "}
          <a href="#" className={styles.consentLink}>
            {form.consentLink}
          </a>
        </span>
      </label>

      <button
        type="submit"
        className={styles.submit}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? form.sending : form.submit}
      </button>
    </form>
  );
}
