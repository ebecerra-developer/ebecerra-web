import fs from "node:fs/promises";
import path from "node:path";

/**
 * Acceso a las plantillas del Generador Social.
 *
 * Las plantillas viven en `<repo>/social-templates/<slug>/` (un nivel arriba
 * del workspace npm). El motor real está en JS plano para que el worker de
 * GitHub Actions las consuma sin tocar TypeScript ni Next.
 *
 * Aquí solo necesitamos leer la metadata (meta.json) para:
 *   1. Listar plantillas en la UI del admin.
 *   2. Validar fields en el endpoint de render.
 */

export interface TemplateField {
  id: string;
  type: "text" | "textarea" | "list" | "image";
  label: string;
  help?: string;
  required?: boolean;
  default?: string | string[];
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  itemMaxLength?: number;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  format: "post-4x5" | "story-9x16" | "reel-9x16" | "square-1x1" | "fb-cover" | "gbp-cover";
  width: number;
  height: number;
  /** Solo para format empezando por "reel-*". Segundos totales del vídeo (incluye hold final). */
  durationSeconds?: number;
  fields: TemplateField[];
}

/** Resuelve la carpeta social-templates/ — sube dos niveles desde apps/es/lib/social/ */
function templatesRoot(): string {
  // apps/es está en process.cwd() durante next dev/build. En runtime serverless
  // process.cwd() suele ser apps/es también. Subimos hasta encontrar la carpeta.
  // Fallback: relativo desde este fichero (no funciona tras bundle, pero ayuda
  // en dev).
  const candidates = [
    path.join(process.cwd(), "..", "..", "social-templates"),
    path.join(process.cwd(), "social-templates"),
    path.join(process.cwd(), "..", "social-templates"),
  ];
  return candidates[0]; // En Vercel monorepo, cwd = apps/es, ../../ = repo root.
}

export async function listTemplates(): Promise<TemplateMeta[]> {
  const dir = templatesRoot();
  let entries: string[] = [];
  try {
    const items = await fs.readdir(dir, { withFileTypes: true });
    entries = items.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }

  const out: TemplateMeta[] = [];
  for (const name of entries) {
    try {
      const raw = await fs.readFile(path.join(dir, name, "meta.json"), "utf8");
      out.push(JSON.parse(raw) as TemplateMeta);
    } catch {
      // ignore folders without meta.json
    }
  }
  return out;
}

export async function getTemplate(id: string): Promise<TemplateMeta | null> {
  const all = await listTemplates();
  return all.find((t) => t.id === id) ?? null;
}

/**
 * Valida los fields recibidos contra el schema de la plantilla.
 * Devuelve los valores normalizados (con defaults aplicados) o lista de errores.
 */
export function validateFields(
  meta: TemplateMeta,
  raw: Record<string, unknown>
): { ok: true; value: Record<string, unknown> } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const out: Record<string, unknown> = {};

  for (const f of meta.fields) {
    const incoming = raw?.[f.id];
    let value: unknown =
      incoming === undefined || incoming === null || incoming === ""
        ? f.default
        : incoming;

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
        errors.push(`${f.id}: máximo ${f.maxLength} caracteres`);
        continue;
      }
    } else if (f.type === "list") {
      if (!Array.isArray(value)) {
        errors.push(`${f.id}: debe ser una lista`);
        continue;
      }
      const arr = value.map((v) => String(v));
      if (f.minItems && arr.length < f.minItems) {
        errors.push(`${f.id}: mínimo ${f.minItems} items`);
        continue;
      }
      if (f.maxItems && arr.length > f.maxItems) {
        errors.push(`${f.id}: máximo ${f.maxItems} items`);
        continue;
      }
      if (f.itemMaxLength) {
        const long = arr.findIndex((s) => s.length > f.itemMaxLength!);
        if (long >= 0) {
          errors.push(`${f.id}[${long}]: máximo ${f.itemMaxLength} caracteres`);
          continue;
        }
      }
      value = arr;
    } else if (f.type === "image") {
      if (typeof value !== "string" || !/^https?:\/\//.test(value)) {
        errors.push(`${f.id}: debe ser una URL http(s)`);
        continue;
      }
    }

    out[f.id] = value;
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, value: out };
}
