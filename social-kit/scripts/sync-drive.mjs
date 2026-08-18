#!/usr/bin/env node
// sync-drive.mjs — Espeja el contenido social a Google Drive vía rclone.
//
// Objetivo: tener el contenido ya generado accesible desde el móvil (app Drive),
// con la MISMA estructura que aquí ({año}/{mes}/{día}-{tipo}-{nombre}), para poder
// publicar día a día sin depender de encender el PC.
//
// Requisito una sola vez:
//   1) Instalar rclone (https://rclone.org/downloads/  o  `winget install Rclone.Rclone`)
//   2) `rclone config` → n(ew) → nombre: gdrive → tipo: drive → autorizar en el navegador
//      (elige la cuenta de Google que uses en el móvil)
//   3) Listo. A partir de aquí, solo se ejecuta este script.
//
// Uso:
//   node social-kit/scripts/sync-drive.mjs            # sincroniza de verdad
//   node social-kit/scripts/sync-drive.mjs --dry-run  # muestra qué haría, sin tocar Drive
//
// Semántica: ESPEJO (rclone sync). Lo que borres/edites en local se refleja en Drive.

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// --- Configuración (edita si cambias de cuenta/carpeta) ---------------------
const REMOTE = 'gdrive';            // nombre del remote creado en `rclone config`
const DEST_ROOT = 'ebecerra-social'; // carpeta raíz dentro de tu Drive
// Subárboles de social-kit/personal/ que se espejan (cada uno mantiene su estructura):
//   2026   → posts/carruseles/reels por {mes}/{día}-{tipo}-{nombre}
//   covers → portada FB, covers Google Business, fondo OBS
const SUBTREES = ['2026', 'covers'];
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');           // .../ebecerra-web
const personalRoot = resolve(repoRoot, 'social-kit', 'personal');

const dryRun = process.argv.includes('--dry-run');

// ¿rclone disponible?
const check = spawnSync('rclone', ['version'], { encoding: 'utf8' });
if (check.error) {
  console.error('✗ rclone no está instalado o no está en el PATH.');
  console.error('  Instálalo con:  winget install Rclone.Rclone');
  console.error('  Luego configura el remote:  rclone config   (nómbralo "gdrive", tipo "drive")');
  process.exit(1);
}

// ¿Existe el remote configurado?
const remotes = spawnSync('rclone', ['listremotes'], { encoding: 'utf8' }).stdout || '';
if (!remotes.split(/\r?\n/).includes(`${REMOTE}:`)) {
  console.error(`✗ No encuentro el remote "${REMOTE}:" en rclone.`);
  console.error('  Créalo con:  rclone config   → n(ew) → nombre: gdrive → tipo: drive → autoriza en el navegador');
  process.exit(1);
}

let failed = false;
for (const sub of SUBTREES) {
  const src = resolve(personalRoot, sub);
  const dest = `${REMOTE}:${DEST_ROOT}/${sub}`;

  if (!existsSync(src)) {
    console.warn(`⚠ Salto "${sub}": no existe ${src}`);
    continue;
  }

  console.log(`${dryRun ? '[DRY-RUN] ' : ''}Espejando  personal/${sub}`);
  console.log(`        →  Google Drive (${dest})`);

  const run = spawnSync('rclone', [
    'sync', src, dest,
    '--progress',
    '--create-empty-src-dirs',
    ...(dryRun ? ['--dry-run'] : []),
  ], { stdio: 'inherit' });

  if (run.status !== 0) {
    console.error(`✗ "${sub}": rclone terminó con código ${run.status}`);
    failed = true;
  }
  console.log('');
}

if (failed) process.exit(1);
console.log(`✓ Sincronización completada${dryRun ? ' (dry-run, no se subió nada)' : ''}.`);
