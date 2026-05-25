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

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render, injectBrandTokens, loadTemplate, validateFields } from "./engine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JOB_ID = process.env.JOB_ID;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
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
  console.error(`[render-job] FAIL — ${message}`, err ?? "");
  await supabase
    .from("social_render_jobs")
    .update({
      status: "failed",
      error_message: message + (err?.message ? `: ${err.message}` : ""),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - t0,
    })
    .eq("id", JOB_ID);
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

  // 5) Resolver branding del tenant (si hay tenant_id)
  let brand = {
    primary: "#047857",
    bg: "#0a0a0a",
    fg: "#fafaf9",
    accent: "#ff6f59",
    logoUrl: null,
    monogram: "eB",
  };
  let tenantSlug = "_personal";
  if (job.tenant_id) {
    const { data: tenant } = await supabase
      .from("tenants")
      .select("slug, name")
      .eq("id", job.tenant_id)
      .maybeSingle();
    if (tenant) tenantSlug = tenant.slug;

    // Branding desde booking_tenants si existe (es donde guardamos branding granular).
    const { data: bt } = await supabase
      .from("booking_tenants")
      .select("branding_color_primary, branding_logo_url, name")
      .eq("tenant_id", job.tenant_id)
      .maybeSingle();
    if (bt?.branding_color_primary) brand.primary = bt.branding_color_primary;
    if (bt?.branding_logo_url) brand.logoUrl = bt.branding_logo_url;
    if (bt?.name) brand.monogram = monogramFor(bt.name);
    else if (tenant?.name) brand.monogram = monogramFor(tenant.name);
  }

  // 6) Renderizar HTML
  let html = injectBrandTokens(tpl.html, brand);
  html = render(html, { ...validation.value, brand });

  // 7) Playwright → PNG (o vídeo cuando llegue la fase animada)
  const browser = await chromium.launch({ headless: true });
  let buf;
  try {
    const ctx = await browser.newContext({
      viewport: { width: tpl.meta.width, height: tpl.meta.height },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500); // dejar que Google Fonts cargue
    buf = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: tpl.meta.width, height: tpl.meta.height },
    });
    await ctx.close();
  } catch (e) {
    await browser.close();
    return fail("Playwright render error", e);
  }
  await browser.close();

  // 8) Subir a Storage
  const storagePath = `${tenantSlug}/${JOB_ID}.png`;
  const { error: upErr } = await supabase.storage
    .from("social-renders")
    .upload(storagePath, buf, {
      contentType: "image/png",
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

  console.log(`[render-job] ✓ done — ${storagePath} (${Date.now() - t0}ms)`);
}

function monogramFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

main().catch((e) => fail("uncaught", e));
