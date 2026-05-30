"use client";

import { useState } from "react";
import type {
  TechContactChrome,
  TechContactForm,
  ContactField,
} from "@ebecerra/sanity-client";

type Status = "idle" | "sending" | "success" | "error";
type AnswerValue = string | string[];

interface Props {
  chrome: TechContactChrome;
  form: TechContactForm;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ContactField;
  value: AnswerValue;
  onChange: (v: AnswerValue) => void;
}) {
  const className =
    "bg-[#0d0d0d] border border-[#2a2a2a] text-[#e0e0e0] px-4 py-3 rounded-md font-sans text-sm w-full outline-none transition-all duration-200 focus:border-[#00ff88] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.08)] placeholder:text-[#888]";

  const common = {
    id: `cf-${field.key}`,
    name: field.key,
    required: field.required,
    placeholder: field.placeholder ?? undefined,
    autoComplete: field.autoComplete ?? undefined,
    className,
  } as const;

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          {...common}
          rows={5}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "select":
      return (
        <select
          {...common}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.placeholder ?? "—"}</option>
          {field.options.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.value}
            </option>
          ))}
        </select>
      );
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
        />
      );
  }
}

export default function ContactClient({ chrome, form }: Props) {
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [website, setWebsite] = useState("");
  const [gdpr, setGdpr] = useState(true);
  const [status, setStatus] = useState<Status>("idle");

  const allFields = form.steps.flatMap((s) => s.fields);
  const requiredKeys = allFields.filter((f) => f.required).map((f) => f.key);

  const setAnswer = (key: string, value: AnswerValue) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missing = requiredKeys.filter((k) => {
      const v = answers[k];
      if (Array.isArray(v)) return v.length === 0;
      return !v || v.trim().length === 0;
    });
    if (missing.length > 0) {
      setStatus("error");
      return;
    }
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
    } catch {
      setStatus("error");
    }
  };

  return (
    <section
      id="contactar"
      aria-labelledby="contact-heading"
      className="py-[64px] px-[clamp(20px,5vw,80px)]"
    >
      <div className="max-w-[600px] mx-auto text-center">
        {chrome.eyebrow && (
          <span className="text-[#00ff88] font-mono text-xs tracking-[0.15em] uppercase block mb-3">
            {chrome.eyebrow}
          </span>
        )}
        {chrome.title && (
          <h2
            id="contact-heading"
            className="text-[clamp(28px,4vw,40px)] font-bold text-white tracking-tight mb-12"
          >
            {chrome.title}
          </h2>
        )}
        {chrome.description && (
          <p className="text-[#a8a29e] text-[15px] mb-12 leading-relaxed">
            {chrome.description}
          </p>
        )}
        <form
          className="flex flex-col gap-4 text-left mb-12"
          onSubmit={onSubmit}
          noValidate
        >
          {form.steps.map((step) =>
            step.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label htmlFor={`cf-${field.key}`} className="sr-only">
                  {field.label}
                </label>
                <FieldInput
                  field={field}
                  value={answers[field.key] ?? ""}
                  onChange={(v) => setAnswer(field.key, v)}
                />
              </div>
            ))
          )}

          <label
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-9999px",
              width: 1,
              height: 1,
              overflow: "hidden",
            }}
          >
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

          <label className="flex items-start gap-2 text-[12px] text-[#888]">
            <input
              type="checkbox"
              checked={gdpr}
              onChange={(e) => setGdpr(e.target.checked)}
              className="mt-1"
            />
            <span>{form.gdprLabel}</span>
          </label>

          <button
            className="self-start bg-transparent border border-[#00ff88] text-[#00ff88] px-7 py-3 rounded-md font-mono text-[13px] tracking-[0.05em] hover:bg-[#00ff88]/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={status === "sending"}
          >
            {status === "sending" ? form.sendingLabel : form.submitLabel}
          </button>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`text-sm mt-1 min-h-[1.25rem] ${
              status === "error" ? "text-[#ff4444]" : "text-[#00ff88]"
            }`}
          >
            {status === "success"
              ? form.successMessage
              : status === "error"
                ? form.errorMessage
                : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
