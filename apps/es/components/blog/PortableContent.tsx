import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity-image";
import { slugify } from "./TableOfContents";
import styles from "./PortableContent.module.css";

function blockText(children: unknown): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(blockText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return blockText((children as { props: { children?: unknown } }).props.children);
  }
  return "";
}

type Props = {
  blocks: unknown[];
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 id={slugify(blockText(children))} className={styles.h2}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(blockText(children))} className={styles.h3}>
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
    normal: ({ children }) => <p className={styles.p}>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className={styles.ul}>{children}</ul>,
    number: ({ children }) => <ol className={styles.ol}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.li}>{children}</li>,
    number: ({ children }) => <li className={styles.li}>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code className={styles.codeInline}>{children}</code>,
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:/.test(href);
      return (
        <a
          href={href}
          className={styles.link}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
    // Las marks rough-* se renderizan como span sin estilo en F2; el efecto
    // visual con rough-notation llega en F4.
    roughUnderline: ({ children }) => <span data-rough="underline">{children}</span>,
    roughCircle: ({ children }) => <span data-rough="circle">{children}</span>,
  },
  types: {
    image: ({ value }) => {
      const v = value as {
        asset?: unknown;
        alt?: string;
        caption?: string;
      };
      if (!v?.asset) return null;
      const src = urlFor(v).width(1280).auto("format").url();
      return (
        <figure className={styles.figure}>
          <Image
            src={src}
            alt={v.alt ?? ""}
            width={1280}
            height={720}
            sizes="(min-width: 800px) 720px, 100vw"
            className={styles.image}
          />
          {v.caption && <figcaption className={styles.caption}>{v.caption}</figcaption>}
        </figure>
      );
    },
    codeBlock: ({ value }) => {
      const v = value as {
        language?: string;
        code?: string;
        filename?: string;
        highlightedHtml?: string;
      };
      if (!v?.code) return null;
      return (
        <div className={styles.codeWrap}>
          {v.filename && <div className={styles.codeFilename}>{v.filename}</div>}
          {v.highlightedHtml ? (
            <div
              className={styles.codeShiki}
              data-lang={v.language ?? "text"}
              dangerouslySetInnerHTML={{ __html: v.highlightedHtml }}
            />
          ) : (
            <pre className={styles.codePre} data-lang={v.language ?? "text"}>
              <code>{v.code}</code>
            </pre>
          )}
        </div>
      );
    },
    callout: ({ value }) => {
      const v = value as { tone?: "info" | "tip" | "warning"; body?: string };
      if (!v?.body) return null;
      return (
        <aside className={styles.callout} data-tone={v.tone ?? "info"}>
          {v.body}
        </aside>
      );
    },
  },
};

export default function PortableContent({ blocks }: Props) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className={styles.content}>
      <PortableText
        value={blocks as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
