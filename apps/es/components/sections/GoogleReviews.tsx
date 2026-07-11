"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { GoogleReviewsData } from "@ebecerra/sanity-client";
import Kicker from "@/components/Kicker";
import styles from "./GoogleReviews.module.css";

type Props = {
  data: GoogleReviewsData | null;
};

// Logo oficial de Google (la "G" a cuatro colores). Inline para no depender de red.
function GoogleG({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

// Fila de 5 estrellas con relleno proporcional (soporta medias: 4,9 → casi 5).
function Stars({ value, label }: { value: number; label: string }) {
  const pct = `${Math.max(0, Math.min(1, value / 5)) * 100}%`;
  const row = "★★★★★";
  return (
    <span
      className={styles.stars}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className={styles.starsTrack} aria-hidden="true">
        {row}
      </span>
      <span
        className={styles.starsFill}
        aria-hidden="true"
        style={{ width: pct }}
      >
        {row}
      </span>
    </span>
  );
}

// Color estable del avatar a partir del nombre (sin depender de Date/Random).
const AVATAR_COLORS = [
  "#1a73e8",
  "#d93025",
  "#188038",
  "#e37400",
  "#9334e6",
  "#12866f",
];
function avatarColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function GoogleReviews({ data }: Props) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const sectionTitleId = useId();

  if (!data || data.reviews.length === 0) return null;

  const { kicker, title, lead, ratingAverage, ratingCount, placeUrl, reviews } =
    data;

  const avg = typeof ratingAverage === "number" ? ratingAverage : 5;
  const avgLabel = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(avg);
  const starsAria = t("ariaStars", { n: avgLabel });

  return (
    <section
      id="resenas"
      aria-labelledby={sectionTitleId}
      className={styles.section}
    >
      <div className={styles.inner}>
        {kicker && <Kicker>{kicker}</Kicker>}
        {title && (
          <h2 id={sectionTitleId} className={styles.heading}>
            {title}
          </h2>
        )}
        {lead && <p className={`lead ${styles.lead}`}>{lead}</p>}

        <div className={styles.summary}>
          <GoogleG className={styles.summaryLogo} />
          <div className={styles.summaryScore}>
            <span className={styles.summaryAvg}>{avgLabel}</span>
            <Stars value={avg} label={starsAria} />
            <span className={styles.summaryCount}>
              {typeof ratingCount === "number"
                ? t("countLabel", { n: ratingCount })
                : t("verified")}
            </span>
          </div>
          {placeUrl && (
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.summaryCta} fx-ripple`}
            >
              {t("seeOnGoogle")} →
            </a>
          )}
        </div>

        <ul className={styles.grid}>
          {reviews.map((r, i) => (
            <li key={i} className={styles.card}>
              <div className={styles.cardHead}>
                <span
                  className={styles.avatar}
                  style={{ backgroundColor: avatarColor(r.author) }}
                  aria-hidden="true"
                >
                  {r.author.trim().charAt(0).toUpperCase()}
                </span>
                <div className={styles.cardMeta}>
                  <span className={styles.cardAuthor}>{r.author}</span>
                  {r.relativeDate && (
                    <span className={styles.cardDate}>{r.relativeDate}</span>
                  )}
                </div>
                <GoogleG className={styles.cardG} />
              </div>
              <Stars
                value={r.rating}
                label={t("ariaStars", { n: String(r.rating) })}
              />
              <p className={styles.cardText}>{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
