import type { CSSProperties } from "react";
import type { DemoBrandOverrides } from "@ebecerra/sanity-client";

const BG_TONES: Record<NonNullable<DemoBrandOverrides["bgTone"]>, { bg: string; surface: string; surfaceSubtle: string; surfaceWarm: string }> = {
  cream: {
    bg: "#fdfaf5",
    surface: "#ffffff",
    surfaceSubtle: "#f5efe6",
    surfaceWarm: "#eadfce",
  },
  "off-white": {
    bg: "#fafaf9",
    surface: "#ffffff",
    surfaceSubtle: "#f5f5f4",
    surfaceWarm: "#e7e5e4",
  },
  sand: {
    bg: "#f7f1e8",
    surface: "#ffffff",
    surfaceSubtle: "#ede2d0",
    surfaceWarm: "#dcc9aa",
  },
  "cool-white": {
    bg: "#fafbfc",
    surface: "#ffffff",
    surfaceSubtle: "#f0f3f6",
    surfaceWarm: "#e2e8ef",
  },
};

/**
 * Devuelve un objeto de CSSProperties con CSS variables sobreescritas según
 * los brand overrides del documento. Si un campo es null, no lo sobreescribe
 * y el template usa el valor por defecto de demos-fisio.css.
 *
 * Convertimos hex → rgba para `--cta-soft` y similares con un degradado de
 * opacidad fijo (10% y 22%) que el template ya espera.
 */
export function brandStyle(brand: DemoBrandOverrides | null): CSSProperties {
  if (!brand) return {};
  const style: Record<string, string> = {};

  if (brand.primaryColor) {
    style["--cta"] = brand.primaryColor;
    style["--cta-hover"] = darken(brand.primaryColor, 0.12);
    style["--cta-soft"] = withAlpha(brand.primaryColor, 0.1);
    style["--cta-soft-strong"] = withAlpha(brand.primaryColor, 0.22);
    style["--success"] = brand.primaryColor;
  }

  if (brand.accentColor) {
    style["--accent"] = brand.accentColor;
    style["--accent-soft"] = withAlpha(brand.accentColor, 0.12);
  }

  if (brand.inkColor) {
    style["--ink"] = brand.inkColor;
    style["--text"] = brand.inkColor;
  }

  const tone = BG_TONES[brand.bgTone ?? "cream"];
  if (tone) {
    style["--bg"] = tone.bg;
    style["--surface"] = tone.surface;
    style["--surface-subtle"] = tone.surfaceSubtle;
    style["--surface-warm"] = tone.surfaceWarm;
  }

  return style as CSSProperties;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1];
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function darken(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const dark = rgb.map((c) => Math.max(0, Math.round(c * (1 - amount))));
  return `#${dark.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
