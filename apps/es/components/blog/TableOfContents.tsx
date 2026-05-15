import styles from "./TableOfContents.module.css";

type Heading = { level: 2 | 3; text: string; id: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractHeadings(blocks: unknown[]): Heading[] {
  const out: Heading[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const b = block as { _type?: string; style?: string; children?: { text?: string }[] };
    if (b._type !== "block") continue;
    if (b.style !== "h2" && b.style !== "h3") continue;
    const text = (b.children ?? [])
      .map((c) => c.text ?? "")
      .join("")
      .trim();
    if (!text) continue;
    out.push({ level: b.style === "h2" ? 2 : 3, text, id: slugify(text) });
  }
  return out;
}

export default function TableOfContents({
  blocks,
  label,
}: {
  blocks: unknown[];
  label: string;
}) {
  const headings = extractHeadings(blocks);
  // Solo se muestra si hay 3+ encabezados — si no, ocupa espacio sin aportar.
  if (headings.length < 3) return null;

  return (
    <aside className={styles.toc} aria-label={label}>
      <div className={styles.label}>{label}</div>
      <ol className={styles.list}>
        {headings.map((h) => (
          <li key={h.id} className={styles.item} data-level={h.level}>
            <a href={`#${h.id}`}>{h.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

// Exporta el helper para que PortableContent pueda inyectar los mismos ids.
export { slugify };
