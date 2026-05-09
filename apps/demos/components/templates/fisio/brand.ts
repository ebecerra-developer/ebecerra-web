import type { CSSProperties } from "react";
import type { DemoBrandOverrides } from "@ebecerra/sanity-client";

type Tone = {
  bg: string;
  bgDeep: string;
  surface: string;
  surfaceSubtle: string;
  surfaceWarm: string;
  border: string;
  borderStrong: string;
};

const BG_TONES: Record<NonNullable<DemoBrandOverrides["bgTone"]>, Tone> = {
  cream: {
    bg: "#f7f0e3",
    bgDeep: "#ede1cb",
    surface: "#ffffff",
    surfaceSubtle: "#f1e7d2",
    surfaceWarm: "#e2d2b3",
    border: "#e0cfaf",
    borderStrong: "#c4ae84",
  },
  "off-white": {
    bg: "#faf8f3",
    bgDeep: "#f0ece0",
    surface: "#ffffff",
    surfaceSubtle: "#f1ede0",
    surfaceWarm: "#e3dcc6",
    border: "#e5dfcc",
    borderStrong: "#c8bfa6",
  },
  sand: {
    bg: "#f4ead4",
    bgDeep: "#e8d9b3",
    surface: "#ffffff",
    surfaceSubtle: "#ecdfc1",
    surfaceWarm: "#d8c498",
    border: "#d5c194",
    borderStrong: "#b39e6e",
  },
  "cool-white": {
    bg: "#fafbf7",
    bgDeep: "#eef0e8",
    surface: "#ffffff",
    surfaceSubtle: "#f0f1ea",
    surfaceWarm: "#dde0d2",
    border: "#dee2d4",
    borderStrong: "#bbc1ad",
  },
};

/**
 * Genera CSS custom properties desde los brand overrides del documento.
 * Si un campo es null, no lo sobreescribe — el template usa el valor por
 * defecto de demos-fisio.css.
 */
export function brandStyle(brand: DemoBrandOverrides | null): CSSProperties {
  if (!brand) return {};
  const style: Record<string, string> = {};

  if (brand.primaryColor) {
    style["--cta"] = brand.primaryColor;
    style["--cta-hover"] = darken(brand.primaryColor, 0.16);
    style["--cta-soft"] = withAlpha(brand.primaryColor, 0.10);
    style["--cta-soft-strong"] = withAlpha(brand.primaryColor, 0.22);
    style["--success"] = brand.primaryColor;
  }

  if (brand.accentColor) {
    style["--accent"] = brand.accentColor;
    style["--accent-soft"] = withAlpha(brand.accentColor, 0.12);
    style["--accent-strong"] = darken(brand.accentColor, 0.15);
  }

  if (brand.inkColor) {
    style["--ink"] = brand.inkColor;
    style["--ink-soft"] = lighten(brand.inkColor, 0.08);
    style["--text"] = brand.inkColor;
  }

  const tone = BG_TONES[brand.bgTone ?? "cream"];
  if (tone) {
    style["--bg"] = tone.bg;
    style["--bg-deep"] = tone.bgDeep;
    style["--surface"] = tone.surface;
    style["--surface-subtle"] = tone.surfaceSubtle;
    style["--surface-warm"] = tone.surfaceWarm;
    style["--border"] = tone.border;
    style["--border-strong"] = tone.borderStrong;
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

function lighten(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const light = rgb.map((c) =>
    Math.min(255, Math.round(c + (255 - c) * amount))
  );
  return `#${light.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}
