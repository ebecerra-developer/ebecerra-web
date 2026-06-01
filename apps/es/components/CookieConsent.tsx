"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./CookieConsent.module.css";

export const CONSENT_STORAGE_KEY = "cookie-consent";
export const CONSENT_EVENT = "cookie-consent-change";

type Props = {
  message: string;
  accept: string;
  reject: string;
  learnMore: string;
  privacyHref: string;
};

/**
 * Banner de consentimiento de cookies publicitarias (Píxel de Meta).
 *
 * Guarda la elección en localStorage y avisa al resto de la app con un evento
 * `cookie-consent-change`. MetaPixel solo se activa si el valor es "accepted".
 * Mientras no haya elección, el píxel no se carga (base legal: consentimiento).
 */
export default function CookieConsent({ message, accept, reject, learnMore, privacyHref }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored !== "accepted" && stored !== "rejected") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      // localStorage no disponible: respetamos la elección solo en esta sesión.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label={message}>
      <p className={styles.text}>
        {message}{" "}
        <Link href={privacyHref} className={styles.link}>
          {learnMore}
        </Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.reject}`} onClick={() => choose("rejected")}>
          {reject}
        </button>
        <button type="button" className={`${styles.btn} ${styles.accept}`} onClick={() => choose("accepted")}>
          {accept}
        </button>
      </div>
    </div>
  );
}
