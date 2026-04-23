import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@ebecerra/sanity-client";
import type { Locale } from "@/i18n/routing";
import styles from "./LegalContent.module.css";

type Props = {
  title: string;
  updatedAt: string | null;
  content: PortableTextBlock[];
  locale: Locale;
};

const legalComponents: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1>{children}</h1>,
    h2: ({ children }) => <h2>{children}</h2>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith("mailto:") ? undefined : "_blank"}
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

function formatDate(isoDate: string, locale: "es" | "en"): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LegalContent({ title, updatedAt, content, locale }: Props) {
  return (
    <div className={styles.section}>
      <article className={styles.article}>
        <h1 className={styles.title}>{title}</h1>
        {updatedAt && (
          <span className={styles.updated}>
            {locale === "es"
              ? `Última actualización: ${formatDate(updatedAt, "es")}`
              : `Last updated: ${formatDate(updatedAt, "en")}`}
          </span>
        )}
        <PortableText value={content} components={legalComponents} />
      </article>
    </div>
  );
}
