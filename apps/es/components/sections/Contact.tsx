"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Status = "idle" | "sending" | "success" | "error";

const INFO: {
  labelKey: "infoEmail" | "infoLinkedin" | "infoGithub" | "infoLocation";
  value: string;
  href?: string;
  external?: boolean;
}[] = [
  {
    labelKey: "infoEmail",
    value: "contacto@ebecerra.es",
    href: "mailto:contacto@ebecerra.es",
  },
  {
    labelKey: "infoLinkedin",
    value: "/in/enriquebecerra",
    href: "https://www.linkedin.com/in/enrique-becerra-garcia/",
    external: true,
  },
  {
    labelKey: "infoGithub",
    value: "/Quiquebgit",
    href: "https://github.com/Quiquebgit",
    external: true,
  },
  { labelKey: "infoLocation", value: "Madrid · España · remoto" },
];

export default function Contact() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("success");
      setForm({ name: "", email: "", message: "", website: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    background: "var(--surface)",
    color: "var(--text)",
    border: "1px solid var(--border-strong)",
    borderRadius: 6,
    padding: "13px 14px",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    color: "var(--text-muted)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: 500,
    marginBottom: -8,
    display: "block",
  };

  return (
    <section
      id="contacto"
      aria-labelledby="contact-heading"
      style={{
        padding: "clamp(40px, 5vw, 72px) clamp(20px, 4vw, 56px)",
        background: "var(--surface-subtle)",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 14,
            fontWeight: 500,
          }}
        >
          //{" "}
          <span style={{ color: "var(--cta)" }}>04.</span>{" "}
          {t("kicker").replace(/^\/\/\s*/i, "")}
        </div>

        <div
          className="contact-split"
          style={{
            display: "grid",
            gap: "clamp(32px, 6vw, 80px)",
            alignItems: "start",
          }}
        >
          <div>
            <h2
              id="contact-heading"
              style={{
                fontSize: "clamp(32px, 4.2vw, 56px)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                margin: "0 0 20px",
              }}
            >
              {t("title")}
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                margin: "0 0 32px",
                maxWidth: 420,
              }}
            >
              {t("lead")}
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {INFO.map((item) => (
                <li
                  key={item.labelKey}
                  style={{ display: "flex", gap: 12, alignItems: "baseline" }}
                >
                  <span style={{ color: "var(--text-muted)", width: 80 }}>
                    {t(item.labelKey).toLowerCase()}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      style={{
                        color: "var(--text)",
                        textDecoration: "underline",
                        textDecorationColor: "var(--border-strong)",
                      }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </li>
              ))}
              <li style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span style={{ color: "var(--text-muted)", width: 80 }}>
                  {t("infoResponse").toLowerCase()}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--cta)",
                      boxShadow: "0 0 0 3px rgba(4,120,87,.15)",
                    }}
                    aria-hidden="true"
                  />
                  {t("infoResponseValue")}
                </span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            aria-describedby="contact-status"
            style={{
              display: "grid",
              gap: 14,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "clamp(22px, 3vw, 36px) clamp(22px, 3vw, 32px)",
            }}
          >
            <label style={labelStyle} htmlFor="contact-name">
              {t("formName")}
            </label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder={t("formNamePlaceholder")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              autoComplete="name"
              aria-invalid={status === "error" ? true : undefined}
            />

            <label style={labelStyle} htmlFor="contact-email">
              {t("formEmail")}
            </label>
            <input
              id="contact-email"
              type="email"
              required
              placeholder={t("formEmailPlaceholder")}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              autoComplete="email"
              aria-invalid={status === "error" ? true : undefined}
            />

            <label style={labelStyle} htmlFor="contact-message">
              {t("formMessage")}
            </label>
            <textarea
              id="contact-message"
              rows={5}
              required
              placeholder={t("formMessagePlaceholder")}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              aria-invalid={status === "error" ? true : undefined}
              style={{
                ...inputStyle,
                resize: "vertical",
                fontFamily: "var(--font-sans)",
              }}
            />

            {/* Honeypot anti-bot: invisible para humanos, visible para scrapers. */}
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
              Website (no rellenar)
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                id="contact-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color:
                    status === "error"
                      ? "#b91c1c"
                      : status === "success"
                        ? "var(--cta)"
                        : "var(--text-muted)",
                  letterSpacing: "0.04em",
                }}
              >
                {status === "success"
                  ? t("formSuccess")
                  : status === "error"
                    ? t("formError")
                    : `→ ${t("infoResponseValue")}`}
              </span>
              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  background:
                    status === "success" ? "var(--text)" : "var(--cta)",
                  color: "var(--text-on-accent)",
                  border: `1.5px solid ${status === "success" ? "var(--text)" : "var(--cta)"}`,
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  fontWeight: 500,
                  padding: "12px 22px",
                  borderRadius: 6,
                  cursor: status === "sending" ? "wait" : "pointer",
                  opacity: status === "sending" ? 0.7 : 1,
                }}
              >
                {status === "success"
                  ? `✓ ${t("formSuccess").split(".")[0]}`
                  : status === "sending"
                    ? t("formSending")
                    : `→ ${t("formSubmit")}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .contact-split { grid-template-columns: 1fr; }
        @media (min-width: 900px) {
          .contact-split { grid-template-columns: 1fr 1.2fr; }
        }
      `}</style>
    </section>
  );
}
