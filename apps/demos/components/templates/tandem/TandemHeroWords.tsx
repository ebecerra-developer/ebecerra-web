"use client";

import { useEffect, useState } from "react";
import styles from "./TandemHeroWords.module.css";

const WORDS = [
  "que sí existen.",
  "que sí facturan.",
  "que sí venden.",
  "que sí crecen.",
];

export default function TandemHeroWords() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <p className={styles.line} aria-live="polite">
      <span className={styles.label}>Para negocios </span>
      <span className={styles.swap}>
        {WORDS.map((w, idx) => (
          <span
            key={w}
            className={`${styles.word} ${idx === i ? styles.wordActive : ""}`}
            aria-hidden={idx !== i}
          >
            {w}
          </span>
        ))}
      </span>
    </p>
  );
}
