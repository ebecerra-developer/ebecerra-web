---
name: git-workflow
description: Flujo de commits y push en este proyecto. Úsalo cuando vayas a hacer commit o push, o cuando el comando `git commit -m "$(cat <<'EOF'...)"` (heredoc) falle.
---

# Git workflow — ebecerra-web

## Workaround obligatorio para commits

El heredoc `git commit -m "$(cat <<'EOF'...)"` **falla en este entorno**. Usa siempre este flujo:

```bash
# 1. Escribir el mensaje con la herramienta Write a un archivo temporal
#    OJO: usar un nombre que empiece por `.` para que sea invisible
#    y esté ya ignorado (ej: `.git-msg-tmp.txt`).
#    Evita `commit-msg.txt` sin prefijo — en el pasado se coló en
#    commits porque no estaba gitignored al principio.

# 2. Commit + limpieza
git commit -F .git-msg-tmp.txt && rm .git-msg-tmp.txt

# 3. Push inmediato
git push
```

El `.gitignore` del proyecto tiene `commit-msg.txt` bloqueado por
compatibilidad histórica, pero el estándar actual es el prefijo
con punto.

## Reglas

- **Idioma:** mensajes en español.
- **Estilo:** descriptivos, en imperativo ("Añadir X", "Corregir Y", "Migrar Z").
- **Autonomía:** push inmediato tras cada commit, sin pedir aprobación previa.
- **Granularidad:** commits frecuentes, no acumular cambios grandes.
- **Co-autoría:** añadir al final del mensaje:
  ```
  Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
  ```

## Anti-patrones

- No usar `git commit --amend` salvo petición explícita del usuario.
- No usar `--no-verify` ni saltar hooks.
- No usar `git add -A` — añadir archivos por nombre específico para evitar incluir secretos o binarios grandes por error.
