import {
  createHighlighter,
  type BundledLanguage,
  type Highlighter,
} from "shiki";

const LANGS: BundledLanguage[] = [
  "ts",
  "js",
  "tsx",
  "jsx",
  "bash",
  "json",
  "html",
  "css",
  "sql",
  "python",
];

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: LANGS,
    });
  }
  return highlighterPromise;
}

const SUPPORTED = new Set<string>(LANGS);

/**
 * Convierte código a HTML highlighted con Shiki (theme github-dark).
 * Si el lenguaje no está cargado o el highlight falla, devuelve null y el
 * caller cae al renderizado plano.
 */
export async function highlightCode(
  code: string,
  language: string | undefined
): Promise<string | null> {
  if (!code) return null;
  const lang = language && SUPPORTED.has(language) ? language : "text";
  try {
    const hl = await getHighlighter();
    return hl.codeToHtml(code, { lang, theme: "github-dark" });
  } catch (err) {
    console.error("[highlightCode] failed:", err);
    return null;
  }
}

type CodeBlock = {
  _type: "codeBlock";
  _key?: string;
  code?: string;
  language?: string;
  filename?: string;
};

/**
 * Pre-procesa un body de Portable Text: para cada codeBlock, añade un
 * campo `highlightedHtml` con el output de Shiki. PortableContent lo lee
 * en el serializer y, si está, lo inyecta vía dangerouslySetInnerHTML.
 */
export async function highlightCodeBlocks<T extends { _type?: string }>(
  blocks: T[]
): Promise<(T & { highlightedHtml?: string })[]> {
  if (!blocks || blocks.length === 0) return blocks ?? [];
  return Promise.all(
    blocks.map(async (b) => {
      if (b._type !== "codeBlock") return b;
      const cb = b as unknown as CodeBlock;
      const html = await highlightCode(cb.code ?? "", cb.language);
      return html ? { ...b, highlightedHtml: html } : b;
    })
  );
}
