#!/usr/bin/env node
/* ==========================================================================
   contrast-check.mjs — ratios de contraste WCAG 2.1 para pares de color.
   --------------------------------------------------------------------------
   Verifica que texto/fondo cumplan AA (≥4.5 normal, ≥3 texto grande/UI).
   Útil al definir/cambiar una paleta de tokens (ver /demos-tienda-ecommerce,
   /design-tokens). El navegador MCP no hace falta: es cálculo puro.

   Uso:
     node scripts/contrast-check.mjs "#795130" "#ffffff" "#bf4a2a" "#ffffff"
       → un ratio por cada PAR (fg bg fg bg …)
     node scripts/contrast-check.mjs            → ejemplo con la paleta tienda
   ========================================================================== */

const hex = (h) => {
  h = h.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const lin = (c) => {
  c /= 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const L = (h) => {
  const [r, g, b] = hex(h);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const ratio = (a, b) => {
  const l1 = L(a), l2 = L(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
};

const verdict = (r) =>
  r >= 7 ? "AAA ✓" : r >= 4.5 ? "AA ✓" : r >= 3 ? "AA-large" : "FAIL ✗";

const args = process.argv.slice(2);
const DEMO = [
  "#795130", "#ffffff", // CTA marrón / blanco
  "#795130", "#f3ebe1", // CTA / tint
  "#bf4a2a", "#ffffff", // acento rust / blanco
  "#675a4b", "#ffffff", // muted / blanco
  "#efe6da", "#2c1d12", // texto claro / footer espresso
];
const flat = args.length >= 2 ? args : DEMO;

let fails = 0;
for (let i = 0; i + 1 < flat.length; i += 2) {
  const [fg, bg] = [flat[i], flat[i + 1]];
  const r = ratio(fg, bg);
  if (r < 4.5) fails++;
  console.log(`${r.toFixed(2).padStart(6)}  ${verdict(r).padEnd(9)}  ${fg} on ${bg}`);
}
console.log(fails ? `\n${fails} par(es) por debajo de AA (4.5)` : "\nTodos AA ✓");
process.exit(fails ? 1 : 0);
