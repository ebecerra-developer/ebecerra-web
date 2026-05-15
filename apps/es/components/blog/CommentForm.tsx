"use client";

import { useState, type FormEvent } from "react";
import styles from "./CommentForm.module.css";

type Props = {
  postSlug: string;
  labels: {
    title: string;
    name: string;
    email: string;
    emailHint: string;
    body: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    privacyNote: string;
  };
};

export default function CommentForm({ postSlug, labels }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting" || status === "success") return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/blog/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postSlug,
          authorName: name,
          authorEmail: email,
          body,
          website,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      setName("");
      setEmail("");
      setBody("");
    } catch (err) {
      console.error("[CommentForm] failed:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.successCard}>
        <p>{labels.success}</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3 className={styles.title}>{labels.title}</h3>
      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>{labels.name}</span>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.label}>
            {labels.email} <span className={styles.hint}>{labels.emailHint}</span>
          </span>
          <input
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
          />
        </label>
      </div>
      <label className={styles.field}>
        <span className={styles.label}>{labels.body}</span>
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          minLength={1}
          maxLength={4000}
          rows={5}
        />
      </label>
      {/* honeypot — oculto a humanos */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <div className={styles.footer}>
        <p className={styles.privacy}>{labels.privacyNote}</p>
        <button
          type="submit"
          className={styles.submit}
          disabled={status === "submitting"}
        >
          {status === "submitting" ? labels.submitting : labels.submit}
        </button>
      </div>
      {status === "error" && <p className={styles.error}>{labels.error}</p>}
    </form>
  );
}
