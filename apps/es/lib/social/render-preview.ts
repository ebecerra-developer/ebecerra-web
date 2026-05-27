import fs from "node:fs/promises";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
// @ts-ignore — engine.mjs es JavaScript puro consumido en runtime.
import { render, injectBrandTokens, injectPreviewAutoplay } from "../../../../social-templates/engine.mjs";

/**
 * Replica server-side el branding + render que hace el worker (sin Playwright).
 * Usado por /api/admin/social/preview para entregar HTML al iframe del admin.
 */

export interface BrandData {
  bg: string;
  fg: string;
  primary: string;
  accent: string;
  logoUrl: string | null;
  logoInverseUrl: string | null;
  monogram: string;
  fontDisplay: string;
  fontBody: string;
  markHtml: string;
}

const DEFAULT_BRAND: Omit<BrandData, "markHtml"> = {
  bg: "#0a0a0a",
  fg: "#fafaf9",
  primary: "#047857",
  accent: "#ff6f59",
  logoUrl: null,
  logoInverseUrl: null,
  monogram: "eB",
  fontDisplay: "Inter",
  fontBody: "Inter",
};

export async function resolveBrand(
  admin: SupabaseClient,
  tenantId: string | null
): Promise<BrandData> {
  const brand: Omit<BrandData, "markHtml"> = { ...DEFAULT_BRAND };

  if (tenantId) {
    const { data: tb } = await admin
      .from("tenant_branding")
      .select(
        "bg, fg, primary_color, accent, logo_url, logo_inverse_url, monogram, font_display, font_body"
      )
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (tb) {
      brand.bg = tb.bg ?? brand.bg;
      brand.fg = tb.fg ?? brand.fg;
      brand.primary = tb.primary_color ?? brand.primary;
      brand.accent = tb.accent ?? brand.accent;
      brand.logoUrl = tb.logo_url ?? null;
      brand.logoInverseUrl = tb.logo_inverse_url ?? null;
      brand.monogram = tb.monogram ?? brand.monogram;
      brand.fontDisplay = tb.font_display ?? brand.fontDisplay;
      brand.fontBody = tb.font_body ?? brand.fontBody;
    } else {
      const { data: tenant } = await admin
        .from("tenants")
        .select("name")
        .eq("id", tenantId)
        .maybeSingle();
      if (tenant?.name) brand.monogram = monogramFor(tenant.name);
    }
  }

  const markHtml = brand.logoUrl
    ? `<img src="${brand.logoUrl}" class="brand-mark__logo" alt="${brand.monogram}" />`
    : `<span class="brand-mark__dot">${brand.monogram}</span>`;

  return { ...brand, markHtml };
}

function templatesRoot(): string {
  return path.join(process.cwd(), "..", "..", "social-templates");
}

export async function renderTemplateHtml(
  templateId: string,
  fields: Record<string, unknown>,
  brand: BrandData
): Promise<string> {
  const tplPath = path.join(templatesRoot(), templateId, "template.html");
  const tplHtml = await fs.readFile(tplPath, "utf8");
  let html: string = injectBrandTokens(tplHtml, brand);
  html = render(html, { ...fields, brand });
  html = injectPreviewAutoplay(html);
  return html;
}

function monogramFor(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
