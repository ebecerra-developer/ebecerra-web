"use client";

import { useEffect, useState } from "react";
import styles from "./GestoriaCookieNotice.module.css";

/**
 * Aviso de cookies mínimo y funcional (RGPD/LSSI): una gestoría que no cumple en
 * su propia web pierde credibilidad. Demo: la elección se guarda en localStorage
 * y no carga ninguna cookie real. Aparece tras montar para no bloquear el LCP.
 */
const KEY = "vega-cookie-choice";

type Strings = {
  text: string;
  accept: string;
  reject: string;
  link: string;
};

export default function GestoriaCookieNotice({ strings }: { strings: Strings }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(KEY);
    } catch {
      stored = null;
    }
    if (!stored) {
      const t = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(t);
    }
  }, []);

  function choose(choice: "all" | "essential") {
    try {
      window.localStorage.setItem(KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.bar} role="dialog" aria-label="Cookies">
      <p className={styles.text}>
        {strings.text}{" "}
        <a href="#" className={styles.link}>
          {strings.link}
        </a>
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.reject}
          onClick={() => choose("essential")}
        >
          {strings.reject}
        </button>
        <button
          type="button"
          className={styles.accept}
          onClick={() => choose("all")}
        >
          {strings.accept}
        </button>
      </div>
    </div>
  );
}
