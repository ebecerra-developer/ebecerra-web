"use client";

import { useState } from "react";
import type {
  ContactForm,
  ContactField,
  ContactSectionMeta,
  ProfileFull,
} from "@ebecerra/sanity-client";
import Kicker from "@/components/Kicker";
import styles from "./Contact.module.css";

type Status = "idle" | "sending" | "success" | "error";

type AnswerValue = string | string[];
type Answers = Record<string, AnswerValue>;

type Props = {
  contactMeta: ContactSectionMeta;
  form: ContactForm;
  profile?: ProfileFull | null;
};

function FieldInput({
  field,
  value,
  onChange,
  invalid,
}: {
  field: ContactField;
  value: AnswerValue;
  onChange: (next: AnswerValue) => void;
  invalid: boolean;
}) {
  const common = {
    id: `cf-${field.key}`,
    name: field.key,
    required: field.required,
    placeholder: field.placeholder ?? undefined,
    autoComplete: field.autoComplete ?? undefined,
    "aria-invalid": invalid || undefined,
  } as const;

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          {...common}
          rows={5}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={styles.textarea}
        />
      );

    case "select":
      return (
        <select
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        >
          <option value="">{field.placeholder ?? "—"}</option>
          {field.options.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.value}
            </option>
          ))}
        </select>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? value : [];
      const toggle = (code: string) =>
        onChange(
          selected.includes(code)
            ? selected.filter((c) => c !== code)
            : [...selected, code]
        );
      return (
        <div
          role="group"
          aria-labelledby={`cf-${field.key}-label`}
          className={styles.chipGroup}
        >
          {field.options.map((opt) => {
            const active = selected.includes(opt.code);
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => toggle(opt.code)}
                className={active ? styles.chipActive : styles.chip}
                aria-pressed={active}
              >
                {opt.value}
              </button>
            );
          })}
        </div>
      );
    }

    case "cards": {
      const current = typeof value === "string" ? value : "";
      return (
        <div className={styles.cardGroup} role="radiogroup">
          {field.options.map((opt) => {
            const active = current === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => onChange(opt.code)}
                className={active ? styles.cardActive : styles.card}
                aria-checked={active}
                role="radio"
              >
                <span className={styles.cardTitle}>{opt.value}</span>
                {opt.sub && <span className={styles.cardSub}>{opt.sub}</span>}
              </button>
            );
          })}
        </div>
      );
    }

    case "email":
    case "tel":
    case "url":
    case "date":
    case "number":
    case "text":
    default:
      return (
        <input
          {...common}
          type={
            field.type === "email"
              ? "email"
              : field.type === "tel"
                ? "tel"
                : field.type === "url"
                  ? "url"
                  : field.type === "date"
                    ? "date"
                    : field.type === "number"
                      ? "number"
                      : "text"
          }
          inputMode={(field.inputMode as React.HTMLAttributes<HTMLInputElement>["inputMode"]) ?? undefined}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={styles.input}
        />
      );
  }
}

// Devuelve la lista de campos del paso agrupada para layout: cada grupo
// comparte un mismo `columns`. textarea/multiselect/cards siempre van solos.
function groupFields(
  fields: ContactField[]
): { columns: 1 | 2 | 3; items: ContactField[] }[] {
  const groups: { columns: 1 | 2 | 3; items: ContactField[] }[] = [];
  let current: { columns: 1 | 2 | 3; items: ContactField[] } | null = null;
  for (const f of fields) {
    const fullWidth =
      f.type === "textarea" || f.type === "multiselect" || f.type === "cards";
    const cols: 1 | 2 | 3 = fullWidth ? 1 : f.columns;
    if (!current || current.columns !== cols || fullWidth) {
      current = { columns: cols, items: [] };
      groups.push(current);
    }
    current.items.push(f);
    if (fullWidth) current = null;
  }
  return groups;
}

export default function ContactClient({ contactMeta, form, profile }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [website, setWebsite] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [missing, setMissing] = useState<string[]>([]);

  const labels = contactMeta.labels;
  const email = profile?.contact?.email ?? "contacto@ebecerra.es";
  const whatsapp = profile?.contact?.whatsapp ?? null;
  const waHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
    : null;
  // Conversión de Google Ads (send_to = AW-ID/etiqueta) desde env vars, sin
  // hardcodear. Solo dispara si gtag está cargado (con consentimiento) y las
  // env existen; si no, no-op.
  const adsSendTo =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_ID &&
    process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL
      ? `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL}`
      : null;
  const linkedinUrl =
    profile?.contact?.linkedinUrl ??
    "https://www.linkedin.com/in/enrique-becerra-garcia/";
  const location = profile?.contact?.location ?? "Madrid · España · remoto";
  const responseTime = profile?.contact?.responseTime ?? "24 h laborables";

  // Validación derivada de la estructura de Sanity, no del componente.
  const allFields = form.steps.flatMap((s) => s.fields);
  const requiredKeys = allFields.filter((f) => f.required).map((f) => f.key);

  const setAnswer = (key: string, value: AnswerValue) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingNow = requiredKeys.filter((k) => {
      const v = answers[k];
      if (Array.isArray(v)) return v.length === 0;
      return !v || v.trim().length === 0;
    });
    if (missingNow.length > 0) {
      setMissing(missingNow);
      setStatus("error");
      return;
    }
    setMissing([]);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, gdpr, website }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setAnswers({});
      // Conversión: lead capturado vía formulario. Solo disparan si el script
      // se ha cargado (con consentimiento); si no, son no-op.
      window.fbq?.("track", "Lead");
      window.gtag?.("event", "generate_lead", { method: "form" });
      if (adsSendTo) window.gtag?.("event", "conversion", { send_to: adsSendTo });
    } catch {
      setStatus("error");
    }
  };

  type InfoItem = {
    label: string;
    value: string;
    href?: string;
    external?: boolean;
  };
  const INFO: InfoItem[] = [
    { label: labels?.email ?? "Email", value: email, href: `mailto:${email}` },
    {
      label: labels?.linkedin ?? "LinkedIn",
      value: "/in/enriquebecerra",
      href: linkedinUrl,
      external: true,
    },
    { label: labels?.location ?? "Ubicación", value: location },
  ];

  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <Kicker>{contactMeta.kicker}</Kicker>

        <div className={styles.split}>
          <div>
            <h2 id="contact-heading" className={styles.heading}>
              {contactMeta.title}
            </h2>
            {contactMeta.lead && (
              <p className={styles.lead}>{contactMeta.lead}</p>
            )}

            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.whatsappBtn} fx-ripple`}
                onClick={() => {
                  // Contacto vía WhatsApp = lead. No-op si no hay consentimiento.
                  window.gtag?.("event", "generate_lead", { method: "whatsapp" });
                  if (adsSendTo)
                    window.gtag?.("event", "conversion", { send_to: adsSendTo });
                  window.fbq?.("track", "Lead");
                }}
              >
                <svg
                  className={styles.whatsappIcon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.477-.911zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                WhatsApp
              </a>
            )}

            <ul className={styles.infoList}>
              {INFO.map((item, i) => (
                <li key={i} className={styles.infoItem}>
                  <span className={styles.infoItemLabel}>{item.label}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className={styles.infoLink}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </li>
              ))}
              <li className={styles.infoItem}>
                <span className={styles.infoItemLabel}>
                  {labels?.response ?? "Respuesta"}
                </span>
                <span className={styles.responseStatus}>
                  <span className={styles.statusDot} aria-hidden="true" />
                  {responseTime}
                </span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            aria-describedby="contact-status"
            className={styles.form}
          >
            {form.steps.map((step) => (
              <div key={step._id} className={styles.formStep}>
                {step.title && (
                  <h3 className={styles.formStepTitle}>{step.title}</h3>
                )}
                {step.description && (
                  <p className={styles.formStepDesc}>{step.description}</p>
                )}
                {step.note && <p className={styles.formStepNote}>{step.note}</p>}

                {groupFields(step.fields).map((group, gi) => (
                  <div
                    key={gi}
                    className={styles.fieldGroup}
                    data-columns={group.columns}
                  >
                    {group.items.map((field) => (
                      <div key={field.key} className={styles.fieldRow}>
                        <label
                          className={styles.label}
                          htmlFor={`cf-${field.key}`}
                          id={`cf-${field.key}-label`}
                        >
                          {field.label}
                          {field.required && (
                            <span aria-hidden="true"> *</span>
                          )}
                        </label>
                        <FieldInput
                          field={field}
                          value={answers[field.key] ?? ""}
                          onChange={(v) => setAnswer(field.key, v)}
                          invalid={
                            status === "error" && missing.includes(field.key)
                          }
                        />
                        {field.helper && (
                          <p className={styles.fieldHelper}>{field.helper}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                {step.footnote && (
                  <p className={styles.formStepFootnote}>{step.footnote}</p>
                )}
              </div>
            ))}

            {/* Honeypot */}
            <label aria-hidden="true" className={styles.honeypot}>
              {form.honeypotLabel}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>

            <label className={styles.gdprRow}>
              <input
                type="checkbox"
                checked={gdpr}
                onChange={(e) => setGdpr(e.target.checked)}
              />
              <span>{form.gdprLabel}</span>
            </label>

            <div className={styles.formActions}>
              <span
                id="contact-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={
                  status === "error"
                    ? styles.formStatusError
                    : status === "success"
                      ? styles.formStatusSuccess
                      : styles.formStatus
                }
              >
                {status === "success"
                  ? form.successMessage
                  : status === "error"
                    ? missing.length > 0
                      ? form.missingRequiredMessage
                      : form.errorMessage
                    : `→ ${responseTime}`}
              </span>
              <button
                type="submit"
                disabled={status === "sending" || !gdpr}
                className={`${styles.submitBtn} fx-ripple${status === "success" ? ` ${styles.submitBtnSuccess}` : ""}${status === "sending" ? ` ${styles.submitBtnSending}` : ""}`}
              >
                {status === "success"
                  ? `${form.successMessage.split(".")[0]} ✓`
                  : status === "sending"
                    ? form.sendingLabel
                    : `${form.submitLabel} →`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
