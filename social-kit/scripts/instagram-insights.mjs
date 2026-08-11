#!/usr/bin/env node
// social-kit/scripts/instagram-insights.mjs
//
// Herramienta canónica de estadísticas de Instagram (fotos, carruseles, reels)
// vía Graph API (Instagram Login). Requiere Node 18+ y un token de larga duración.
//
// Qué hace en cada ejecución:
//   1. Renueva el token (+60 días) y guarda IG_TOKEN + IG_TOKEN_UPDATED en social-kit/.env.local.
//      Avisa con 15 días de margen si la renovación automática falla (hay que regenerarlo a mano).
//   2. Descarga las estadísticas de todas las publicaciones.
//   3. Las vincula con la carpeta local de cada pieza (personal/YYYY/MM/NN-slug/):
//        - por instagram.json de la carpeta (exacto), o
//        - por el texto de la caption (una vez) — y entonces ESCRIBE instagram.json para fijar el vínculo.
//   4. Vuelca todo a personal/insights/insights.json (+ .csv) y añade una foto al histórico history.ndjson.
//
// Uso:  node social-kit/scripts/instagram-insights.mjs
//       (lee IG_TOKEN de social-kit/.env.local o del entorno)
// Opcional:  IG_LIMIT=20 node ...   -> solo las N publicaciones más recientes

import {
  readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SOCIAL_KIT = join(SCRIPT_DIR, '..');           // social-kit/
const REPO_ROOT = join(SOCIAL_KIT, '..');            // ebecerra-web/
const PERSONAL = join(SOCIAL_KIT, 'personal');
const INSIGHTS_DIR = join(PERSONAL, 'insights');

const BASE = 'https://graph.instagram.com';
const TOKEN_TTL_DAYS = 60;
const MARGIN_DAYS = 15; // aviso de "regenera el token" con este margen antes de caducar

// ── .env.local: carga + reescritura preservando comentarios ──────────────────
let ENV_FILE = null;

function loadEnvLocal() {
  const candidates = [join(SOCIAL_KIT, '.env.local'), join(SCRIPT_DIR, '.env.local')];
  for (const file of candidates) {
    try {
      const txt = readFileSync(file, 'utf8');
      ENV_FILE = file;
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[m[1]]) process.env[m[1]] = val;
      }
      break;
    } catch { /* siguiente candidato */ }
  }
}
loadEnvLocal();

function persistEnv(updates) {
  const file = ENV_FILE || join(SOCIAL_KIT, '.env.local');
  let txt = '';
  try { txt = readFileSync(file, 'utf8'); } catch { /* se crea */ }
  for (const [key, val] of Object.entries(updates)) {
    const re = new RegExp(`^\\s*${key}\\s*=.*$`, 'm');
    const line = `${key}=${val}`;
    if (re.test(txt)) txt = txt.replace(re, line);
    else txt += `${txt && !txt.endsWith('\n') ? '\n' : ''}${line}\n`;
  }
  writeFileSync(file, txt);
  ENV_FILE = file;
}

// ── Modo --trends: evolución desde history.ndjson (offline, no toca la API) ──
function runTrends() {
  // 1) Rendimiento por mes de publicación — se calcula YA con el snapshot actual
  //    (cada post lleva su fecha + métricas). Responde "¿mejora mi contenido?".
  try {
    const snap = JSON.parse(readFileSync(join(INSIGHTS_DIR, 'insights.json'), 'utf8'));
    const byMonth = {};
    for (const r of snap) {
      const m = (r.fecha || '').slice(0, 7);
      if (m) (byMonth[m] = byMonth[m] || []).push(r);
    }
    console.log('\nRendimiento por mes de publicación (con los datos actuales):');
    console.log('  mes       posts   alcance medio   descubr. medio   interac. media');
    for (const m of Object.keys(byMonth).sort()) {
      const rs = byMonth[m];
      const avg = (k) => rs.reduce((n, r) => n + (+r[k] || 0), 0) / rs.length;
      console.log('  ' + m
        + '   ' + String(rs.length).padStart(5)
        + '   ' + avg('alcance').toFixed(0).padStart(13)
        + '   ' + avg('descubrimiento_x1k').toFixed(1).padStart(14)
        + '   ' + avg('interacciones').toFixed(1).padStart(14));
    }
  } catch { console.log('(No pude leer insights.json para el rendimiento por mes.)'); }

  // 2) Evolución real de cada post en el tiempo — solo desde snapshots acumulados.
  let rows;
  try {
    rows = readFileSync(join(INSIGHTS_DIR, 'history.ndjson'), 'utf8')
      .trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch { console.log('\nAún no hay histórico acumulado (history.ndjson).'); return; }
  const dates = [...new Set(rows.map((r) => r.date))].sort();
  console.log(`\nHistórico: ${rows.length} filas · ${dates.length} snapshot(s): ${dates.join(', ')}`);
  if (dates.length < 2) {
    console.log('Necesitas ≥2 días de snapshots para ver tendencias. Vuelve tras varias semanas de ejecuciones.');
    return;
  }
  console.log('\nAlcance total por snapshot (¿crece la cuenta?):');
  for (const d of dates) {
    const rs = rows.filter((r) => r.date === d);
    const reach = rs.reduce((n, r) => n + (r.alcance || 0), 0);
    const inter = rs.reduce((n, r) => n + (r.interacciones || 0), 0);
    console.log(`  ${d}: alcance ${reach} · interacciones ${inter} · ${rs.length} posts`);
  }
  const byId = new Map();
  for (const r of rows) {
    if (!byId.has(r.mediaId)) byId.set(r.mediaId, []);
    byId.get(r.mediaId).push(r);
  }
  const growth = [];
  for (const snaps of byId.values()) {
    if (snaps.length < 2) continue;
    snaps.sort((a, b) => a.date.localeCompare(b.date));
    const delta = (snaps.at(-1).alcance || 0) - (snaps[0].alcance || 0);
    if (delta > 0) growth.push({ delta, tipo: snaps[0].tipo, fecha: snaps[0].fecha, last: snaps.at(-1).alcance });
  }
  growth.sort((a, b) => b.delta - a.delta);
  console.log('\nPosts que siguen ganando alcance (cola larga):');
  if (!growth.length) console.log('  (ninguno gana alcance entre snapshots)');
  for (const g of growth.slice(0, 10)) console.log(`  +${g.delta} → ${g.tipo} ${g.fecha} (ahora ${g.last})`);
}

if (process.argv.includes('--trends')) { runTrends(); process.exit(0); }

const TOKEN = process.env.IG_TOKEN;
const TOKEN_UPDATED = process.env.IG_TOKEN_UPDATED; // ISO YYYY-MM-DD o undefined
const LIMIT = process.env.IG_LIMIT ? Number(process.env.IG_LIMIT) : Infinity;

if (!TOKEN) {
  console.error(
    'Falta IG_TOKEN.\n' +
      'Crea social-kit/.env.local con una línea:  IG_TOKEN=IGAA...\n' +
      '(Se obtiene en developers.facebook.com -> app ebecerra-insights -> caso de uso Instagram\n' +
      ' -> "Genera identificadores de acceso" -> Generar token.)',
  );
  process.exit(1);
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso + 'T00:00:00Z').getTime()) / 86400000);

// ── API ──────────────────────────────────────────────────────────────────────
async function api(path, params = {}) {
  const url = new URL(BASE + path);
  url.searchParams.set('access_token', process.env.IG_TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(`${json.error.message} (code ${json.error.code})`);
  return json;
}

// Renueva el token de larga duración (+60 días). Solo si tiene >24 h de vida.
async function refreshToken() {
  try {
    const res = await api('/refresh_access_token', { grant_type: 'ig_refresh_token' });
    if (res.access_token) {
      persistEnv({ IG_TOKEN: res.access_token, IG_TOKEN_UPDATED: todayISO() });
      process.env.IG_TOKEN = res.access_token;
      const dias = Math.round((res.expires_in || 0) / 86400);
      console.log(`✓ Token renovado (+${dias} días) y guardado en .env.local.`);
      return { ok: true };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
  return { ok: false };
}

// Aviso de salud del token con 15 días de margen (solo relevante si el refresh falla).
function reportTokenHealth(refresh) {
  if (refresh.ok) return;
  if (!TOKEN_UPDATED) {
    console.log('ℹ Sin fecha de token registrada aún; se guardará en la próxima renovación.');
    return;
  }
  const left = TOKEN_TTL_DAYS - daysSince(TOKEN_UPDATED);
  if (daysSince(TOKEN_UPDATED) < 1) {
    console.log('ℹ Token nuevo (<24 h): aún no se puede renovar. Se renovará solo la próxima vez.');
  } else if (left <= MARGIN_DAYS) {
    console.log(
      `\n🚨 TOKEN A PUNTO DE CADUCAR (~${left} días) y la renovación automática ha fallado.\n` +
        '   Regenéralo a mano: developers.facebook.com -> app ebecerra-insights -> caso de uso\n' +
        '   Instagram -> "Genera identificadores de acceso" -> Generar token, pégalo en\n' +
        '   social-kit/.env.local (IG_TOKEN=...) y vuelve a ejecutar.\n',
    );
  } else {
    console.log(`⚠ La renovación falló, pero al token le quedan ~${left} días. Reintenta más tarde.`);
  }
}

// ── Descarga de media + insights ─────────────────────────────────────────────
const BASE_METRICS = ['reach', 'views', 'likes', 'comments', 'saved', 'shares', 'total_interactions'];
const REEL_EXTRA = ['ig_reels_avg_watch_time', 'ig_reels_video_view_total_time'];

async function getAllMedia() {
  const media = [];
  let params = { fields: 'id,caption,media_type,media_product_type,timestamp,permalink', limit: '50' };
  let path = '/me/media';
  while (path) {
    const page = await api(path, params);
    media.push(...(page.data || []));
    const after = page.paging?.cursors?.after;
    if (after && media.length < 300) params = { ...params, after };
    else path = null;
  }
  return media;
}

const readValue = (m) => m?.values?.[0]?.value ?? m?.total_value?.value ?? 0;

async function getInsights(id, metrics) {
  try {
    const res = await api(`/${id}/insights`, { metric: metrics.join(',') });
    const out = {};
    for (const m of res.data || []) out[m.name] = readValue(m);
    return out;
  } catch {
    const out = {};
    for (const metric of metrics) {
      try {
        const res = await api(`/${id}/insights`, { metric });
        out[metric] = readValue(res.data?.[0]);
      } catch { /* métrica no aplica a este post */ }
    }
    return out;
  }
}

function tipoDe(m) {
  if (m.media_product_type === 'REELS') return 'REEL';
  if (m.media_type === 'CAROUSEL_ALBUM') return 'CARRUSEL';
  if (m.media_type === 'VIDEO') return 'VÍDEO';
  return 'FOTO';
}

// ── Vínculo con las carpetas locales ─────────────────────────────────────────
const SKIP_DIRS = new Set(['assets', 'highlights', 'covers', 'legacy', 'insights', '00-ideas', 'img', 'para-subir']);

function findPostFolders(dir) {
  const folders = [];
  const walk = (d) => {
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    if (entries.some((e) => e.isFile() && e.name === 'captions.md')) folders.push(d);
    for (const e of entries) {
      if (e.isDirectory() && !SKIP_DIRS.has(e.name)) walk(join(d, e.name));
    }
  };
  walk(dir);
  return folders;
}

// Palabras que no distinguen un slug (tipo de pieza + relleno frecuente).
const SLUG_STOP = new Set(['post', 'carrusel', 'reel', 'story', 'video', 'de', 'la', 'el', 'un', 'una', 'web', 'que', 'tu', 'con', 'para', 'v2', 'v3']);

const norm = (s) => (s || '').toLowerCase().replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
const scoreSlug = (tokens, capNorm) => tokens.reduce((n, t) => n + (capNorm.includes(t) ? 1 : 0), 0);
const repoRel = (abs) => relative(REPO_ROOT, abs).split(sep).join('/');

// Deriva de la ruta la fecha (día = prefijo NN de 2 dígitos, convención jun-2026+) y los tokens del slug.
function folderMetaOf(folder) {
  const rel = repoRel(folder);
  const parts = rel.split('/');
  const idx = parts.indexOf('personal');
  const year = parts[idx + 1] || null;
  const month = /^\d{2}$/.test(parts[idx + 2] || '') ? parts[idx + 2] : null;
  const name = parts[parts.length - 1];
  const pm = name.match(/^(\d+)-/);
  const prefix = pm ? pm[1] : null;
  const pathDate = (year && month && prefix && prefix.length <= 2)
    ? `${year}-${month}-${prefix.padStart(2, '0')}` : null;
  const slug = name.replace(/^\d+-(post|carrusel|reel|story|video)?-?/, '');
  const slugTokens = slug.split('-').map((t) => t.toLowerCase()).filter((t) => t.length > 2 && !SLUG_STOP.has(t));
  return { folder, rel, year, month, pathDate, slugTokens, lock: readLock(folder) };
}

function readLock(folder) {
  try { return JSON.parse(readFileSync(join(folder, 'instagram.json'), 'utf8')); } catch { return null; }
}
function writeLock(folder, data) {
  writeFileSync(join(folder, 'instagram.json'), JSON.stringify(data, null, 2) + '\n');
}

// ── Main ─────────────────────────────────────────────────────────────────────
// ── Dashboard local (HTML autocontenido, se abre con doble clic) ─────────────
const DASH_CSS = `
:root{--green:#047857;--green2:#065F46;--cream:#FAFAF9;--ink:#0A0A0A;--line:#E7E5E4;}
*{box-sizing:border-box;}body{margin:0;padding:32px;font-family:Inter,system-ui,sans-serif;background:var(--cream);color:var(--ink);}
h1{font-size:26px;margin:0 0 20px;}h1 span{font-weight:400;color:#666;font-size:16px;}
h2{font-size:18px;margin:32px 0 12px;}h2 small{font-weight:400;color:#888;font-size:13px;}
.cards{display:flex;gap:16px;flex-wrap:wrap;}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:16px 20px;min-width:150px;}
.card .k{font-size:13px;color:#666;}.card .v{font-size:28px;font-weight:800;color:var(--green);margin-top:4px;}
.bars{display:flex;flex-direction:column;gap:8px;max-width:680px;}
.bar{display:flex;align-items:center;gap:12px;}
.bar .lbl{width:90px;font-size:13px;font-weight:600;}
.bar .track{flex:1;background:#eee;border-radius:6px;height:18px;overflow:hidden;}
.bar .fill{display:block;height:100%;background:var(--green);}
.bar .num{width:44px;text-align:right;font-variant-numeric:tabular-nums;font-size:13px;}
.tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:#fff;}
table{border-collapse:collapse;width:100%;font-size:13px;}
th,td{padding:8px 10px;text-align:right;white-space:nowrap;border-bottom:1px solid var(--line);}
th{background:#f3f4f2;cursor:pointer;user-select:none;position:sticky;top:0;font-size:12px;}
th:first-child,td:first-child{text-align:left;}
td.tit{text-align:left;white-space:normal;max-width:280px;}
td.tit a{color:var(--green);text-decoration:none;}td.tit a:hover{text-decoration:underline;}
tbody tr:hover{background:#fafaf5;}
`;
const DASH_JS = `
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
document.getElementById('meta').textContent='· '+ROWS.length+' publicaciones';
var n=ROWS.length;
var avgReach=Math.round(ROWS.reduce(function(a,r){return a+(r.alcance||0);},0)/n);
var disc=ROWS.reduce(function(a,r){return a+(r.guardados||0)+(r.compartidos||0);},0);
var reels=ROWS.filter(function(r){return r.tipo==='REEL';});
var avgWatch=reels.length?(reels.reduce(function(a,r){return a+(+r.seg_medios||0);},0)/reels.length).toFixed(1)+'s':'—';
var cards=[['Publicaciones',n],['Alcance medio',avgReach],['Guardados+compartidos',disc],['Visionado medio reels',avgWatch]];
document.getElementById('cards').innerHTML=cards.map(function(c){return '<div class="card"><div class="k">'+c[0]+'</div><div class="v">'+c[1]+'</div></div>';}).join('');
var tipos={};
ROWS.forEach(function(r){(tipos[r.tipo]=tipos[r.tipo]||[]).push(r.descubrimiento_x1k||0);});
var bars=Object.keys(tipos).map(function(t){var arr=tipos[t];return [t,arr.reduce(function(a,b){return a+b;},0)/arr.length];}).sort(function(a,b){return b[1]-a[1];});
var maxB=Math.max.apply(null,bars.map(function(b){return b[1];}).concat([1]));
document.getElementById('bars').innerHTML=bars.map(function(b){return '<div class="bar"><span class="lbl">'+b[0]+'</span><span class="track"><span class="fill" style="width:'+(b[1]/maxB*100)+'%"></span></span><span class="num">'+b[1].toFixed(1)+'</span></div>';}).join('');
var COLS=[['fecha','Fecha'],['tipo','Tipo'],['alcance','Alcance'],['reproducciones','Reprod.'],['guardados','Guard.'],['compartidos','Comp.'],['comentarios','Coment.'],['interacciones','Interac.'],['seg_medios','Seg.'],['descubrimiento_x1k','Descubr.'],['titular','Titular']];
var sortKey='descubrimiento_x1k',sortDir=-1;
function render(){
  ROWS.sort(function(a,b){var x=a[sortKey],y=b[sortKey];if(typeof x==='string'){return sortDir*String(x).localeCompare(String(y));}return sortDir*((+x||0)-(+y||0));});
  var h='<thead><tr>'+COLS.map(function(c){return '<th data-k="'+c[0]+'">'+c[1]+(c[0]===sortKey?(sortDir<0?' ▾':' ▴'):'')+'</th>';}).join('')+'</tr></thead><tbody>';
  h+=ROWS.map(function(r){var link=r.permalink?'<a href="'+r.permalink+'" target="_blank">'+esc(r.titular)+'</a>':esc(r.titular);return '<tr>'+COLS.map(function(c){return '<td'+(c[0]==='titular'?' class="tit"':'')+'>'+(c[0]==='titular'?link:esc(r[c[0]]))+'</td>';}).join('')+'</tr>';}).join('');
  h+='</tbody>';document.getElementById('tbl').innerHTML=h;
  var ths=document.querySelectorAll('th');for(var i=0;i<ths.length;i++){ths[i].onclick=function(){var k=this.getAttribute('data-k');if(k===sortKey){sortDir*=-1;}else{sortKey=k;sortDir=-1;}render();};}
}
render();
`;
function writeDashboard(rows) {
  const data = JSON.stringify(rows).replace(/</g, '\\u003c');
  const html = '<!doctype html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Insights · @ebecerra.es</title><style>' + DASH_CSS + '</style></head><body>'
    + '<h1>Insights de Instagram <span id="meta"></span></h1>'
    + '<div id="cards" class="cards"></div>'
    + '<h2>Descubrimiento medio por formato <small>(guardados+compartidos por 1.000 de alcance)</small></h2><div id="bars" class="bars"></div>'
    + '<h2>Publicaciones <small>(clic en cabecera para ordenar)</small></h2>'
    + '<div class="tablewrap"><table id="tbl"></table></div>'
    + '<script>var ROWS=' + data + ';\n' + DASH_JS + '<\/script></body></html>';
  writeFileSync(join(INSIGHTS_DIR, 'dashboard.html'), html);
}

// ── Main ─────────────────────────────────────────────────────────────────────
const refresh = await refreshToken();
reportTokenHealth(refresh);

let media;
try {
  media = (await getAllMedia()).filter((m) => m.media_product_type !== 'STORY').slice(0, LIMIT);
} catch (e) {
  console.error(`\n✗ No se pudieron descargar las publicaciones: ${e.message}`);
  console.error('  Si el token ha caducado, regenéralo (ver instrucciones arriba) y reintenta.\n');
  process.exit(1);
}

console.log(`\nEncontradas ${media.length} publicaciones. Sacando estadísticas...\n`);

// Metadatos de todas las carpetas + índice por mediaId (locks ya fijados).
const folderMeta = findPostFolders(PERSONAL).map(folderMetaOf);
const byMediaId = new Map();
for (const fm of folderMeta) if (fm.lock?.mediaId) byMediaId.set(String(fm.lock.mediaId), fm);

// Resuelve la carpeta de un post: lock exacto > fecha de ruta > fecha+slug > slug del mes.
function resolveFolder(p, used) {
  const locked = byMediaId.get(String(p.id));
  if (locked) return { fm: locked, how: 'mediaId' };
  const date = (p.timestamp || '').slice(0, 10);
  const capNorm = norm(p.caption);
  const free = folderMeta.filter((fm) => !fm.lock && !used.has(fm.folder));

  let cands = free.filter((fm) => fm.pathDate === date);
  if (cands.length === 1) return { fm: cands[0], how: 'date' };
  if (cands.length > 1) {
    cands.sort((a, b) => scoreSlug(b.slugTokens, capNorm) - scoreSlug(a.slugTokens, capNorm));
    if (scoreSlug(cands[0].slugTokens, capNorm) > scoreSlug(cands[1].slugTokens, capNorm)) return { fm: cands[0], how: 'date+slug' };
  }

  const ym = date.slice(0, 7);
  const scored = free
    .filter((fm) => fm.year && fm.month && `${fm.year}-${fm.month}` === ym)
    .map((fm) => ({ fm, s: scoreSlug(fm.slugTokens, capNorm) }))
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s);
  if (scored.length && (scored.length === 1 || scored[0].s > scored[1].s)) return { fm: scored[0].fm, how: 'slug' };
  return { fm: null, how: null };
}

const ms2s = (ms) => Math.round((ms / 1000) * 10) / 10;
const rows = [];
const usedFolders = new Set();
const matchStats = { mediaId: 0, date: 0, 'date+slug': 0, slug: 0 };
const unmatched = [];

for (const p of media) {
  const tipo = tipoDe(p);
  const metrics = tipo === 'REEL' ? [...BASE_METRICS, ...REEL_EXTRA] : BASE_METRICS;
  const ins = await getInsights(p.id, metrics);

  const { fm, how } = resolveFolder(p, usedFolders);
  let folder = null;
  if (fm) {
    folder = fm.folder;
    usedFolders.add(fm.folder);
    matchStats[how]++;
    if (!fm.lock) { // fijar el vínculo la primera vez (los mediaId ya venían fijados)
      writeLock(fm.folder, {
        mediaId: p.id,
        permalink: p.permalink,
        mediaType: tipo,
        publishedAt: (p.timestamp || '').slice(0, 10),
        matchedBy: how,
      });
      fm.lock = { mediaId: p.id };
    }
  } else {
    unmatched.push(`${(p.timestamp || '').slice(0, 10)} · ${(p.caption || '').replace(/\s+/g, ' ').slice(0, 45)}`);
  }

  const reach = ins.reach || 0;
  const saves = ins.saved || 0;
  const shares = ins.shares || 0;
  const descubrimiento = reach ? Math.round(((saves + shares) / reach) * 1000 * 10) / 10 : 0;

  rows.push({
    fecha: (p.timestamp || '').slice(0, 10),
    tipo,
    alcance: reach,
    reproducciones: ins.views || 0,
    likes: ins.likes || 0,
    comentarios: ins.comments || 0,
    guardados: saves,
    compartidos: shares,
    interacciones: ins.total_interactions || 0,
    seg_medios: tipo === 'REEL' ? ms2s(ins.ig_reels_avg_watch_time || 0) : '',
    descubrimiento_x1k: descubrimiento,
    carpeta: folder ? repoRel(folder).replace('social-kit/personal/', '') : '—',
    localPath: folder ? repoRel(folder) : null,
    mediaId: p.id,
    permalink: p.permalink,
    titular: (p.caption || '').replace(/\s+/g, ' ').slice(0, 40),
  });
}

rows.sort((a, b) => b.descubrimiento_x1k - a.descubrimiento_x1k);

console.table(rows.map(({ localPath, mediaId, permalink, ...rest }) => rest));

// ── Salidas: snapshot (sobrescribe) + histórico (append) ─────────────────────
mkdirSync(INSIGHTS_DIR, { recursive: true });

writeFileSync(join(INSIGHTS_DIR, 'insights.json'), JSON.stringify(rows, null, 2));
if (rows.length) {
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(',')]
    .concat(rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? '')).join(',')))
    .join('\n');
  writeFileSync(join(INSIGHTS_DIR, 'insights.csv'), csv);
}
writeDashboard(rows);

// Histórico: una foto por post por día. Evita duplicar si ya se corrió hoy.
const histFile = join(INSIGHTS_DIR, 'history.ndjson');
let histTxt = '';
try { histTxt = readFileSync(histFile, 'utf8'); } catch { /* no existe aún */ }
const today = todayISO();
if (!histTxt.includes(`"date":"${today}"`)) {
  const lines = rows.map((r) => JSON.stringify({
    date: today,
    mediaId: r.mediaId,
    tipo: r.tipo,
    fecha: r.fecha,
    alcance: r.alcance,
    reproducciones: r.reproducciones,
    guardados: r.guardados,
    compartidos: r.compartidos,
    comentarios: r.comentarios,
    interacciones: r.interacciones,
    seg_medios: r.seg_medios,
  })).join('\n') + '\n';
  appendFileSync(histFile, lines);
  console.log(`✓ Histórico actualizado (${rows.length} filas con fecha ${today}).`);
} else {
  console.log(`ℹ Histórico ya tenía una foto de hoy (${today}); no se duplica.`);
}

const matchedCount = rows.length - unmatched.length;
console.log(`\nVinculadas ${matchedCount}/${rows.length} publicaciones a su carpeta local`
  + ` (lock: ${matchStats.mediaId}, fecha: ${matchStats.date}, fecha+slug: ${matchStats['date+slug']}, slug: ${matchStats.slug}).`);
if (unmatched.length) {
  console.log(`Sin carpeta (${unmatched.length}) — casi todas de mayo (numeración de secuencia) o colisiones de fecha.`);
  console.log('Para fijarlas: crea un instagram.json en la carpeta con {"mediaId":"...","permalink":"..."}.');
  for (const u of unmatched) console.log(`  · ${u}`);
}
console.log(`\nSalidas en social-kit/personal/insights/: insights.json, insights.csv, history.ndjson`);
