import type { Locale } from "@/i18n/routing";
import styles from "./CommentList.module.css";

export type ApprovedComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

type Props = {
  comments: ApprovedComment[];
  locale: Locale;
  emptyLabel: string;
  countLabel: (n: number) => string;
};

function formatDateTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CommentList({
  comments,
  locale,
  emptyLabel,
  countLabel,
}: Props) {
  if (comments.length === 0) {
    return <p className={styles.empty}>{emptyLabel}</p>;
  }
  return (
    <div className={styles.list}>
      <div className={styles.count}>{countLabel(comments.length)}</div>
      {comments.map((c) => (
        <article key={c.id} className={styles.comment}>
          <header className={styles.header}>
            <span className={styles.author}>{c.authorName}</span>
            <time className={styles.date} dateTime={c.createdAt}>
              {formatDateTime(c.createdAt, locale)}
            </time>
          </header>
          <p className={styles.body}>{c.body}</p>
        </article>
      ))}
    </div>
  );
}
