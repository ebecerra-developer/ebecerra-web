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
 * Inyecta tokens de marca como CSS vars en el <head>.
 * @param {string} html
 * @param {object} brand — { primary, bg, fg, accent, logoUrl }
 * @returns {string}
 */
export function injectBrandTokens(html, brand) {
  const vars = Object.entries(brand)
    .filter(([k, v]) => v != null && v !== "" && k !== "monogram")
    .map(([k, v]) => `--brand-${kebab(k)}: ${v};`)
    .join(" ");
  if (!vars) return html;
  const styleTag = `<style id="brand-tokens">:root{${vars}}</style>`;
  if (html.includes("</head>")) return html.replace("</head>", `${styleTag}</head>`);
  return styleTag + html;
}

function kebab(s) {
  return s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
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
