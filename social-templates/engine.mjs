// Motor minimalista de templating para las plantillas social.
// Soporta:
//   {{var}}              — substituye con HTML-escape
//   {{{var}}}            — substituye sin escape (raw HTML)
//   {{#each list}}…{{this}}…{{/each}} — itera arrays
//   {{brand.primary}}    — accesores con punto
//
// Sin lógica condicional (deliberado): si una plantilla necesita ifs, mejor crear
// otra plantilla. Mantenemos el motor estúpidamente simple para que sea fácil
// auditar lo que renderiza.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

function getValue(scope, pathStr) {
  // "items" → scope.items
  // "brand.primary" → scope.brand.primary
  // "this" → scope.__this (current iteration value)
  if (pathStr === "this") return scope.__this;
  let cur = scope;
  for (const part of pathStr.split(".")) {
    if (cur == null) return undefined;
    cur = cur[part];
  }
  return cur;
}

/**
 * Renderiza un HTML string con un scope de datos.
 * @param {string} html
 * @param {object} scope — { ...fields, brand: { primary, bg, fg, accent, logoUrl, monogram } }
 * @returns {string}
 */
export function render(html, scope) {
  // 1) Bloques {{#each X}}…{{/each}} (no anidados — KISS)
  html = html.replace(
    /\{\{#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (_, key, body) => {
      const arr = getValue(scope, key);
      if (!Array.isArray(arr)) return "";
      return arr
        .map((item) => render(body, { ...scope, __this: item }))
        .join("");
    }
  );

  // 2) {{{raw}}} sin escapar
  html = html.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, key) => {
    const v = getValue(scope, key);
    return v == null ? "" : String(v);
  });

  // 3) {{var}} con escape
  html = html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const v = getValue(scope, key);
    return v == null ? "" : escapeHtml(v);
  });

  return html;
}

/**
 * Inyecta script de autoplay del timeline para la PREVIEW (iframe del admin).
 * El worker establece window.__capturing = true antes de cargar la página,
 * así que en el worker este script no auto-arranca.
 *
 * Solo afecta a plantillas que definen window.__tl. Las estáticas lo ignoran.
 */
export function injectPreviewAutoplay(html) {
  const script = `<script>
    setTimeout(function() {
      if (window.__capturing) return;
      var tl = window.__tl;
      if (!tl || typeof tl.play !== 'function') return;
      tl.play(0);
      // Loop infinito para preview
      tl.repeat(-1);
      tl.repeatDelay(0.5);
    }, 200);
  </script>`;
  if (html.includes("</body>")) return html.replace("</body>", `${script}</body>`);
  return html + script;
}

/**
 * Inyecta tokens de marca como CSS vars + carga las fuentes de Google.
 * @param {string} html
 * @param {object} brand — { bg, fg, primary, accent, logoUrl, logoInverseUrl, monogram, fontDisplay, fontBody }
 * @returns {string}
 */
export function injectBrandTokens(html, brand) {
  const vars = [];
  if (brand.bg) vars.push(`--brand-bg: ${brand.bg};`);
  if (brand.fg) vars.push(`--brand-fg: ${brand.fg};`);
  if (brand.primary) vars.push(`--brand-primary: ${brand.primary};`);
  if (brand.accent) vars.push(`--brand-accent: ${brand.accent};`);
  if (brand.fontDisplay) vars.push(`--brand-font-display: '${brand.fontDisplay}', serif;`);
  if (brand.fontBody) vars.push(`--brand-font-body: '${brand.fontBody}', sans-serif;`);

  // Carga ambas familias desde Google Fonts (las plantillas suelen usar weights 600-900).
  const fontFamilies = new Set();
  if (brand.fontDisplay) fontFamilies.add(brand.fontDisplay);
  if (brand.fontBody) fontFamilies.add(brand.fontBody);
  const fontParams = [...fontFamilies]
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@400;600;700;800;900`)
    .join("&");
  const fontLink = fontParams
    ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fontParams}&display=swap">`
    : "";

  const styleTag = `<style id="brand-tokens">:root{${vars.join(" ")}}</style>`;
  const inject = fontLink + styleTag;

  if (html.includes("</head>")) return html.replace("</head>", `${inject}</head>`);
  return inject + html;
}

/**
 * Carga la metadata + HTML de una plantilla por su id.
 * @param {string} templateId
 * @param {string} [rootDir] — directorio social-templates/ (auto-detecta si omites)
 */
export async function loadTemplate(templateId, rootDir) {
  const dir = rootDir ?? __dirname;
  const tplDir = path.join(dir, templateId);
  const [metaRaw, htmlRaw] = await Promise.all([
    fs.readFile(path.join(tplDir, "meta.json"), "utf8"),
    fs.readFile(path.join(tplDir, "template.html"), "utf8"),
  ]);
  const meta = JSON.parse(metaRaw);
  return { meta, html: htmlRaw };
}

/**
 * Lista todos los templateIds disponibles (carpetas con meta.json + template.html).
 */
export async function listTemplates(rootDir) {
  const dir = rootDir ?? __dirname;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      const metaPath = path.join(dir, e.name, "meta.json");
      const metaRaw = await fs.readFile(metaPath, "utf8");
      out.push(JSON.parse(metaRaw));
    } catch {
      // carpeta sin meta — la ignoramos
    }
  }
  return out;
}

/**
 * Valida que los `fields` recibidos cumplen el schema de la plantilla.
 * Devuelve `{ ok: true, value }` o `{ ok: false, errors: [] }`.
 */
export function validateFields(meta, rawFields) {
  const errors = [];
  const out = {};
  for (const f of meta.fields) {
    const raw = rawFields?.[f.id];
    let value = raw === undefined || raw === null || raw === "" ? f.default : raw;

    if (value === undefined || value === null || value === "") {
      if (f.required) errors.push(`${f.id}: obligatorio`);
      continue;
    }

    if (f.type === "text" || f.type === "textarea") {
      if (typeof value !== "string") {
        errors.push(`${f.id}: debe ser texto`);
        continue;
      }
      if (f.maxLength && value.length > f.maxLength) {
        errors.push(`${f.id}: máximo ${f.maxLength} caracteres (tiene ${value.length})`);
        continue;
      }
    } else if (f.type === "list") {
      if (!Array.isArray(value)) {
        errors.push(`${f.id}: debe ser una lista`);
        continue;
      }
      if (f.minItems && value.length < f.minItems) {
        errors.push(`${f.id}: mínimo ${f.minItems} items`);
        continue;
      }
      if (f.maxItems && value.length > f.maxItems) {
        errors.push(`${f.id}: máximo ${f.maxItems} items`);
        continue;
      }
      value = value.map(String);
      if (f.itemMaxLength) {
        const long = value.findIndex((s) => s.length > f.itemMaxLength);
        if (long >= 0) {
          errors.push(`${f.id}[${long}]: máximo ${f.itemMaxLength} caracteres`);
          continue;
        }
      }
    } else if (f.type === "image") {
      if (typeof value !== "string" || !/^https?:\/\//.test(value)) {
        errors.push(`${f.id}: debe ser una URL`);
        continue;
      }
    }

    out[f.id] = value;
  }
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: out };
}
