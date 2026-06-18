"use client";

import { useEffect, useState } from "react";
import styles from "./GestoriaCountdown.module.css";

type Deadline = { md: string; label: string };
type Strings = {
  label: string;
  daysWord: string;
  dayWord: string;
  todayLabel: string;
  nextLabel: string;
  aria: string;
};

type Computed = { days: number; label: string };

/**
 * Cuenta atrás al próximo vencimiento fiscal. WOW útil: demuestra que la
 * gestoría piensa en tus plazos. Cero peso (solo cálculo de fechas en cliente).
 * Se calcula tras montar para evitar mismatch de hidratación (el servidor no
 * sabe "hoy" del visitante). Hasta entonces muestra un esqueleto neutro.
 */
function computeNext(deadlines: Deadline[]): Computed | null {
  if (deadlines.length === 0) return null;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let best: Computed | null = null;
  for (const d of deadlines) {
    const [m, day] = d.md.split("-").map((n) => parseInt(n, 10));
    if (!m || !day) continue;
    // este año o el siguiente si ya pasó
    for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
      const target = Date.UTC(year, m - 1, day);
      const days = Math.round((target - todayUtc) / 86_400_000);
      if (days >= 0) {
        if (!best || days < best.days) best = { days, label: d.label };
        break;
      }
    }
  }
  return best;
}

export default function GestoriaCountdown({
  deadlines,
  strings,
}: {
  deadlines: Deadline[];
  strings: Strings;
}) {
  const [next, setNext] = useState<Computed | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNext(computeNext(deadlines));
  }, [deadlines]);

  const isToday = next?.days === 0;
  const word = next?.days === 1 ? strings.dayWord : strings.daysWord;

  return (
    <div
      className={styles.card}
      role="group"
      aria-label={strings.aria}
      data-ready={next ? "true" : "false"}
    >
      <span className={styles.label}>
        <span className={styles.pulse} aria-hidden="true" />
        {strings.label}
      </span>
      <p className={styles.value}>
        {next ? (
          isToday ? (
            <span className={styles.today}>{strings.todayLabel}</span>
          ) : (
            <>
              <span className={styles.number}>{next.days}</span>
              <span className={styles.unit}>
                {word} {strings.nextLabel}
              </span>
            </>
          )
        ) : (
          <span className={styles.skeleton} aria-hidden="true">
            ··
          </span>
        )}
      </p>
      <p className={styles.deadline}>{next?.label ?? " "}</p>
    </div>
  );
}
