# Hook PostToolUse: recordatorio para revisar piezas de social-kit con los testers.
# Lee el JSON del evento por stdin, filtra por la ruta del fichero y, si es una
# pieza de social-kit (index.html o captions.md en una subcarpeta), inyecta un
# recordatorio al modelo via hookSpecificOutput.additionalContext.
$ErrorActionPreference = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
try { $j = $raw | ConvertFrom-Json } catch { exit 0 }

$p = $j.tool_input.file_path
if (-not $p) { exit 0 }
$norm = ($p -replace '\\', '/')

if ($norm -match 'social-kit/.+/(index\.html|captions\.md)$') {
  $ctx = 'RECORDATORIO (hook social-kit): acabas de crear o editar una pieza de social-kit. Antes de darla por cerrada, pasala por los subagentes tester-copy y tester-visual-social (lanzalos en paralelo) y aplica o itera sus hallazgos. Si aun no estan cargados en el registro (sesion sin reiniciar), simula cada uno con un general-purpose que lea su .md en .claude/agents/.'
  $out = [pscustomobject]@{
    hookSpecificOutput = [pscustomobject]@{
      hookEventName     = 'PostToolUse'
      additionalContext = $ctx
    }
  }
  $out | ConvertTo-Json -Compress -Depth 5
}
exit 0
