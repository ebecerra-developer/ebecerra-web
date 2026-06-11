#!/usr/bin/env node
/**
 * lint:marca — checks deterministas de las convenciones del proyecto (idea-lab 012).
 *
 * Convierte en comprobaciones automáticas las reglas DURAS que antes se revisaban
 * a mano o con testers LLM (probabilísticos). Lo subjetivo sigue siendo de testers.
 *
 * Filosofía: SEÑAL ALTA, RUIDO BAJO. Un linter ruidoso se ignora. Por eso:
 *   - severidad `violacion` solo para lo que casi seguro hay que arreglar (zona pública);
 *   - `deuda` para zonas con convención propia (admin) — informativo, no bloquea;
 *   - `aviso` para lo que necesita ojo humano (un tester o Enrique) para confirmar.
 *   - los checks que daban >50% de falsos positivos se han retirado (ver CHANGELOG abajo).
 *
 * Uso:  node scripts/lint-marca.mjs [--strict] [--all]
 *   - normal: informe agrupado, exit 0 (informativo)
 *   - --strict: exit 1 si hay `violacion` (para un pre-commit/CI futuro)
 *   - --all: no recorta las listas largas
 *
 * Supresión puntual: añade `lint-marca-ok` en la misma línea (comentario) para
 * silenciar un hallazgo consciente.
 *
 * CHANGELOG de calibración (2026-06-12, primera ejecución real):
 *   - quitado `sanity-sin-catch`: 9/9 falsos positivos — el fallback vive
 *     centralizado en packages/sanity-client/queries.ts (.catch por query), no
 *     en cada page.tsx. La política se cumple por arquitectura.
 *   - quitado `maxwidth-padding-sin-calc`: 34/34 falsos — casi siempre era el
 *     `.inner` de un patrón outer+inner correcto. Lo coge mejor tester-visual-web.
 *   - `inline-styles`: admin excluido (convención propia) salvo recuento; se
 *     ignoran los dinámicos (valor con `${...}` o `--custom-prop`).
 *   - `hex`: acotado a apps/es + apps/tech (demos tienen paleta propia scopeada
 *     por [data-template]); se ignoran blanco/negro/grises puros y #25D366 (WhatsApp).
 *   - `social-fuente-prohibida`: baja a aviso y excluye piezas que promocionan
 *     demos de cliente (reflejan la tipografía del cliente, no la marca propia).
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep, basename } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const STRICT = process.argv.includes("--strict");
const ALL = process.argv.includes("--all");

const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "dist", "_legacy", ".git", "public"]);

function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full, exts, out);
    } else if (exts.some((e) => name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

const lines = (file) => readFileSync(file, "utf8").split(/\r?\n/);
const rel = (file) => relative(ROOT, file).split(sep).join("/");
const suppressed = (line) => line.includes("lint-marca-ok");
const isAdmin = (r) => r.includes("(admin)") || r.includes("/admin/");

// Inline styles legítimos por framework (Next ImageResponse / error boundaries sin CSS Modules)
const FRAMEWORK_INLINE_OK = /(?:^|\/)(opengraph-image|twitter-image|icon|apple-icon|global-error|not-found)\.tsx$/;
// Páginas transaccionales con layout propio fuera del design system (confirmación/cancelación de cita)
const TRANSACTIONAL = /\/(cita|confirm|cancel)\//;
// Slugs de demos de cliente: sus piezas sociales reflejan la marca del cliente, no la de ebecerra
const CLIENT_DEMO = /(equilibrio|marta|claudia|eco|llaullau|reservas|fisio|tandem|vibrant|editorial)/i;

const findings = [];
function add(check, severity, file, lineNo, text) {
  findings.push({ check, severity, file: rel(file), line: lineNo, text: String(text).trim().slice(0, 110) });
}

// ── 1. style={{ en JSX (política 3: CSS fuera del JSX) ──────────────────────
// violacion = componente público de apps/es|tech. deuda = admin / transaccional.
// se ignoran inline dinámicos (valor calculado con ${...}) y custom props (--var).
{
  const files = walk(join(ROOT, "apps"), [".tsx", ".jsx"]);
  for (const f of files) {
    const r = rel(f);
    if (FRAMEWORK_INLINE_OK.test(r)) continue;
    lines(f).forEach((ln, i) => {
      if (!ln.includes("style={{") || suppressed(ln)) return;
      const after = ln.split("style={{")[1] ?? "";
      if (/^\s*["']--/.test(after)) return; // custom property: legítimo (toggle, etc.)
      if (after.includes("${") || /\$\{|`/.test(ln)) return; // valor dinámico runtime: inevitable
      const sev = isAdmin(r) || TRANSACTIONAL.test(r) ? "deuda" : "violacion";
      add("inline-styles", sev, f, i + 1, ln);
    });
  }
}

// ── 2. Paridad de keys i18n es.json ↔ en.json (política 4) ───────────────────
// 100% determinista; next-intl casca en runtime si falta una key usada.
{
  const flat = (obj, prefix = "", out = new Set()) => {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) flat(v, key, out);
      else out.add(key);
    }
    return out;
  };
  for (const app of ["es", "tech", "demos"]) {
    const dir = join(ROOT, "apps", app, "messages");
    const esPath = join(dir, "es.json");
    const enPath = join(dir, "en.json");
    if (!existsSync(esPath) || !existsSync(enPath)) continue;
    const es = flat(JSON.parse(readFileSync(esPath, "utf8")));
    const en = flat(JSON.parse(readFileSync(enPath, "utf8")));
    for (const k of es) if (!en.has(k)) add("i18n-paridad", "violacion", enPath, 0, `falta en en.json: ${k}`);
    for (const k of en) if (!es.has(k)) add("i18n-paridad", "violacion", esPath, 0, `falta en es.json: ${k}`);
  }
}

// ── 3. Gotcha Lightning CSS: backdrop-filter emparejado con @supports not ────
// preventivo (caro de descubrir; ver feedback_lightning_css_backdrop_filter).
{
  for (const f of walk(join(ROOT, "apps"), [".css"])) {
    const src = readFileSync(f, "utf8");
    if (/@supports\s+not\s*\(\s*backdrop-filter/.test(src) && /backdrop-filter\s*:/.test(src)) {
      add("backdrop-supports", "violacion", f, 0, "@supports not(backdrop-filter) borra la prop base al compilar (gotcha Next 16)");
    }
  }
}

// ── 4. margin auto sin width en flex item (gotcha flex shrink) ───────────────
// preventivo; ver feedback_flex_auto_margin_shrink.
{
  for (const f of walk(join(ROOT, "apps"), [".module.css"])) {
    const src = readFileSync(f, "utf8");
    const blockRe = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = blockRe.exec(src))) {
      const [, selector, body] = m;
      if (body.includes("lint-marca-ok")) continue;
      if (/margin(?:-inline)?\s*:\s*(?:0\s+)?auto/.test(body) && !/width\s*:/.test(body) && !/max-width\s*:/.test(body)) {
        const lineNo = src.slice(0, m.index).split("\n").length;
        add("margin-auto-sin-width", "aviso", f, lineNo, `${selector.trim().slice(0, 40)} → margin:auto sin width:100% encoge el flex item a content-size`);
      }
    }
  }
}

// ── 5. social-kit: fuentes prohibidas (Inter-only en marca propia) ───────────
// aviso (no violacion): las piezas que promocionan demos de cliente reflejan la
// tipografía del cliente; el tester-visual-social juzga el caso real.
{
  const files = walk(join(ROOT, "social-kit"), [".html", ".css"]).filter((f) => !rel(f).includes("piezas-game"));
  for (const f of files) {
    const r = rel(f);
    const esDemoCliente = CLIENT_DEMO.test(r);
    let hit = false;
    lines(f).forEach((ln, i) => {
      if (suppressed(ln) || hit) return;
      if (/Fraunces|DM Sans/i.test(ln)) {
        hit = true; // un hallazgo por archivo basta
        const nota = esDemoCliente ? " (parece pieza de demo de cliente — verificar)" : " (pieza de marca propia: debe ser Inter)";
        add("social-fuente", "aviso", f, i + 1, `Fraunces/DM Sans en pieza social${nota}`);
      }
    });
  }
}

// ── 6. Hex hardcodeado en apps/es + apps/tech (design-tokens) ────────────────
// aviso; demos excluidas (paleta propia scopeada por [data-template]).
// se ignoran blanco/negro/grises puros y #25D366 (verde WhatsApp, brand externa).
{
  const IGNORE = new Set(["#fff", "#ffffff", "#000", "#000000", "#25d366"]);
  for (const app of ["es", "tech"]) {
    for (const f of walk(join(ROOT, "apps", app), [".module.css", "globals.css"])) {
      const r = rel(f);
      if (isAdmin(r)) continue; // admin: layering tonal propio
      lines(f).forEach((ln, i) => {
        if (suppressed(ln)) return;
        const m = (ln.match(/#[0-9a-fA-F]{3,8}\b/g) || []).filter((h) => !IGNORE.has(h.toLowerCase()));
        if (m.length) add("hex-fuera-de-tokens", "aviso", f, i + 1, `${m.join(" ")} → ¿var(--…) de packages/tokens?`);
      });
    }
  }
}

// ── 7. Jerga técnica en copy visible de apps/es (política 6) ─────────────────
{
  const targets = [
    ...walk(join(ROOT, "apps", "es", "messages"), [".json"]),
    ...walk(join(ROOT, "apps", "es", "components"), [".tsx"]),
  ];
  for (const f of targets) {
    lines(f).forEach((ln, i) => {
      if (suppressed(ln) || /^\s*(import|export)\b/.test(ln)) return;
      const m = ln.match(/\b(Magnolia|Java(?!Script)|Spring Boot|Spring)\b/);
      if (m) add("jerga-visible", "aviso", f, i + 1, `"${m[1]}" en posible copy visible de apps/es (público no técnico)`);
    });
  }
}

// ── informe ──────────────────────────────────────────────────────────────────

const order = { violacion: 0, deuda: 1, aviso: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.check.localeCompare(b.check) || a.file.localeCompare(b.file));

const byCheck = new Map();
for (const f of findings) {
  if (!byCheck.has(f.check)) byCheck.set(f.check, []);
  byCheck.get(f.check).push(f);
}

const icon = { violacion: "✖", deuda: "▲", aviso: "·" };
const nViol = findings.filter((f) => f.severity === "violacion").length;
const nDeuda = findings.filter((f) => f.severity === "deuda").length;
const nAviso = findings.filter((f) => f.severity === "aviso").length;

console.log(`\nlint:marca — ${findings.length} hallazgos (${nViol} violación · ${nDeuda} deuda · ${nAviso} aviso)\n`);
for (const [check, items] of byCheck) {
  const counts = items.reduce((a, f) => ((a[f.severity] = (a[f.severity] ?? 0) + 1), a), {});
  console.log(`■ ${check}  (${Object.entries(counts).map(([s, n]) => `${n} ${s}`).join(", ")})`);
  const MAX = ALL ? items.length : 10;
  for (const f of items.slice(0, MAX)) console.log(`  ${icon[f.severity]} ${f.file}${f.line ? ":" + f.line : ""}  ${f.text}`);
  if (items.length > MAX) console.log(`  … y ${items.length - MAX} más (usa --all para verlos)`);
  console.log("");
}

console.log(`Resumen: ${nViol} violación (zona pública, arréglalo) · ${nDeuda} deuda (admin/transaccional, informativo) · ${nAviso} aviso (revisar a ojo / tester)`);
if (STRICT && nViol > 0) process.exit(1);
