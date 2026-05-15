import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import styles from "./PostMeta.module.css";

type Props = {
  publishedAt: string;
  updatedAt?: string | null;
  readingMinutes: number;
  authorName?: string | null;
  locale: Locale;
};

function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PostMeta({
  publishedAt,
  updatedAt,
  readingMinutes,
  authorName,
  locale,
}: Props) {
  const t = useTranslations("blog");
  const dateToShow = updatedAt ?? publishedAt;
  const dateLabel = updatedAt
    ? t("updatedOn", { date: formatDate(dateToShow, locale) })
    : t("publishedOn", { date: formatDate(dateToShow, locale) });

  return (
    <div className={styles.meta}>
      <time dateTime={dateToShow}>{dateLabel}</time>
      <span className={styles.dot}>·</span>
      <span>{t("readingMinutes", { minutes: readingMinutes })}</span>
      {authorName && (
        <>
          <span className={styles.dot}>·</span>
          <span>{t("byAuthor", { name: authorName })}</span>
        </>
      )}
    </div>
  );
}
