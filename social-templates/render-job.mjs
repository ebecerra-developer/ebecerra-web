#!/usr/bin/env node
// Worker que renderiza un job de la cola social_render_jobs.
// Ejecutado por el workflow .github/workflows/social-render.yml.
//
// Input vía env vars:
//   JOB_ID                 — uuid del job en social_render_jobs
//   SUPABASE_URL           — URL del proyecto
//   SUPABASE_SECRET_KEY    — service_role key (bypassa RLS, OK para worker server-side)
//
// Flujo:
//   1. Lee el job (status debe ser 'queued' o 'rendering')
//   2. Marca 'rendering' + started_at
//   3. Carga template + tenant branding
//   4. Renderiza HTML → PNG con Playwright (1080×1350 etc.)
//   5. Sube a Storage bucket 'social-renders' con path "<tenant_slug>/<jobId>.png"
//   6. Marca 'done' + storage_path + completed_at + duration_ms
//   7. Si falla en cualquier paso: marca 'failed' + error_message
//
// La UI del admin recibe el cambio vía Supabase Realtime y muestra el resultado.

console.log("[render-job] node booted, loading modules…");

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { render, injectBrandTokens, injectPreviewAutoplay, loadTemplate, validateFields } from "./engine.mjs";

const require = createRequire(import.meta.url);
const FFMPEG = require("ffmpeg-static");
const FPS = 30;

console.log("[render-job] modules loaded");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .trim() es crítico: copy-paste de secrets en GitHub a veces incluye trailing \n.
const JOB_ID = process.env.JOB_ID?.trim();
const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY?.trim();

console.log(`[render-job] env check — JOB_ID:${JOB_ID ? "ok" : "MISSING"} URL:${SUPABASE_URL ? `ok(${SUPABASE_URL.length})` : "MISSING"} KEY:${SUPABASE_SECRET_KEY ? `ok(${SUPABASE_SECRET_KEY.length})` : "MISSING"}`);
const GH_RUN_ID = process.env.GITHUB_RUN_ID ?? null;
const GH_RUN_URL = (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && GH_RUN_ID)
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${GH_RUN_ID}`
  : null;

if (!JOB_ID || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("Missing required env vars: JOB_ID, SUPABASE_URL, SUPABASE_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const t0 = Date.now();

async function fail(message, err) {
  console.error(`[render-job] FAIL — ${message}`);
  if (err) console.error(err.stack ?? err.message ?? err);
  try {
    const { error: updErr } = await supabase
      .from("social_render_jobs")
      .update({
        status: "failed",
        error_message: message + (err?.message ? `: ${err.message}` : ""),
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - t0,
      })
      .eq("id", JOB_ID);
    if (updErr) console.error("[render-job] DB update for fail() also failed:", updErr);
  } catch (e) {
    console.error("[render-job] fail() update threw:", e);
  }
  process.exit(1);
}

async function main() {
  console.log(`[render-job] Job ${JOB_ID}`);

  // 1) Cargar job
  const { data: job, error: jobErr } = await supabase
    .from("social_render_jobs")
    .select("*")
    .eq("id", JOB_ID)
    .maybeSingle();
  if (jobErr) return fail("DB read error", jobErr);
  if (!job) return fail(`Job ${JOB_ID} no encontrado`);
  if (job.status !== "queued" && job.status !== "rendering") {
    console.log(`[render-job] Job ya estaba en estado ${job.status} — abort`);
    process.exit(0);
  }

  // 2) Marcar rendering + run id
  await supabase
    .from("social_render_jobs")
    .update({
      status: "rendering",
      started_at: new Date().toISOString(),
      gh_run_id: GH_RUN_ID,
      gh_run_url: GH_RUN_URL,
    })
    .eq("id", JOB_ID);

  // 3) Cargar plantilla
  let tpl;
  try {
    tpl = await loadTemplate(job.template_id, __dirname);
  } catch (e) {
    return fail(`Plantilla "${job.template_id}" no encontrada`, e);
  }

  // 4) Validar fields
  const validation = validateFields(tpl.meta, job.fields);
  if (!validation.ok) {
    return fail(`Campos inválidos: ${validation.errors.join("; ")}`);
  }

  // 5) Resolver branding del tenant (si hay tenant_id) desde tenant_branding.
  // Fuente canónica única — no leer de booking_tenants ni chatbot_configs aquí.
  let brand = {
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
  let tenantSlug = "_personal";
  if (job.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug, name")
      .eq("id", job.tenant_id)
      .maybeSingle();
    if (tenant) tenantSlug = tenant.slug;

    const { data: tb } = await supabase
      .from("tenant_branding")
      .select("bg, fg, primary_color, accent, logo_url, logo_inverse_url, monogram, font_display, font_body")
      .eq("tenant_id", job.tenant_id)
      .maybeSingle();
    if (tb) {
      brand.bg = tb.bg ?? brand.bg;
      brand.fg = tb.fg ?? brand.fg;
      brand.primary = tb.primary_color ?? brand.primary;
      brand.accent = tb.accent ?? brand.accent;
      brand.logoUrl = tb.logo_url ?? null;
      brand.logoInverseUrl = tb.logo_inverse_url ?? null;
      brand.monogram = tb.monogram ?? monogramFor(tenant?.name ?? "");
      brand.fontDisplay = tb.font_display ?? brand.fontDisplay;
      brand.fontBody = tb.font_body ?? brand.fontBody;
    } else if (tenant?.name) {
      brand.monogram = monogramFor(tenant.name);
    }
  }

  // 6) Pre-render del bloque marca (logo img o monograma) — el motor no soporta ifs.
  brand.markHtml = brand.logoUrl
    ? `<img src="${brand.logoUrl}" class="brand-mark__logo" alt="${brand.monogram}" />`
    : `<span class="brand-mark__dot">${brand.monogram}</span>`;

  // 7) Renderizar HTML
  let html = injectBrandTokens(tpl.html, brand);
  html = render(html, { ...validation.value, brand });
  html = injectPreviewAutoplay(html); // no-op aquí porque __capturing=true

  // 7) Render — diverge según formato (imagen estática o vídeo animado)
  const isVideo = tpl.meta.format === "reel-9x16";
  const browser = await chromium.launch({ headless: true });
  let storagePath, contentType, buf;

  try {
    const ctx = await browser.newContext({
      viewport: { width: tpl.meta.width, height: tpl.meta.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    // El flag __capturing evita que el script de autoplay del preview arranque
    // la timeline antes de que tomemos control desde aquí.
    await page.addInitScript(() => { window.__capturing = true; });

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // fonts + libs (GSAP) settle

    if (isVideo) {
      const duration = Number(tpl.meta.durationSeconds) || 10;
      const totalFrames = Math.round(FPS * duration);
      console.log(`[render-job] video ${duration}s = ${totalFrames} frames`);

      // Verifica que la plantilla expone window.__tl
      const hasTl = await page.evaluate(() => Boolean(window.__tl));
      if (!hasTl) {
        await browser.close();
        return fail("Plantilla reel-9x16 sin window.__tl — define una gsap.timeline({ paused: true }) y asígnala a window.__tl");
      }

      await page.evaluate(() => {
        if (window.gsap) window.gsap.ticker.lagSmoothing(0);
        window.__tl.pause();
      });

      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "social-frames-"));
      console.log(`[render-job] tmp frames: ${tmpDir}`);

      for (let i = 0; i < totalFrames; i++) {
        const t = i / FPS;
        await page.evaluate((time) => window.__tl.seek(time, false), t);
        // doble rAF para que GSAP termine de pintar antes del screenshot
        await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
        const file = path.join(tmpDir, `frame-${String(i).padStart(4, "0")}.png`);
        await page.screenshot({ path: file, clip: { x: 0, y: 0, width: tpl.meta.width, height: tpl.meta.height } });
        if (i % 30 === 0) console.log(`  frame ${i}/${totalFrames}`);
      }
      await ctx.close();
      await browser.close();

      // ffmpeg: frames → mp4 H.264 con poster en frame ~1.2s
      const mp4Path = path.join(tmpDir, "out.mp4");
      console.log("[render-job] encoding mp4…");
      const r = spawnSync(FFMPEG, [
        "-y",
        "-framerate", String(FPS),
        "-i", path.join(tmpDir, "frame-%04d.png"),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "20",
        "-preset", "medium",
        "-movflags", "+faststart",
        mp4Path,
      ], { stdio: "inherit" });
      if (r.status !== 0) return fail(`ffmpeg encoding failed (exit ${r.status})`);

      buf = fs.readFileSync(mp4Path);
      storagePath = `${tenantSlug}/${JOB_ID}.mp4`;
      contentType = "video/mp4";

      // Cleanup
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } else {
      // STATIC: screenshot único
      buf = await page.screenshot({
        type: "png",
        clip: { x: 0, y: 0, width: tpl.meta.width, height: tpl.meta.height },
      });
      await ctx.close();
      await browser.close();
      storagePath = `${tenantSlug}/${JOB_ID}.png`;
      contentType = "image/png";
    }
  } catch (e) {
    await browser.close().catch(() => {});
    return fail("Render error", e);
  }

  // 8) Subir a Storage
  const { error: upErr } = await supabase.storage
    .from("social-renders")
    .upload(storagePath, buf, {
      contentType,
      upsert: true,
    });
  if (upErr) return fail("Storage upload error", upErr);

  // 9) Marcar done
  const { error: doneErr } = await supabase
    .from("social_render_jobs")
    .update({
      status: "done",
      storage_path: storagePath,
      width: tpl.meta.width,
      height: tpl.meta.height,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - t0,
    })
    .eq("id", JOB_ID);
  if (doneErr) return fail("DB update error", doneErr);

  console.log(`[render-job] ✓ done — ${storagePath} (${Date.now() - t0}ms, ${(buf.length / 1024).toFixed(0)}KB)`);
}

function monogramFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

main().catch((e) => fail("uncaught", e));
