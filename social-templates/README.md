# social-templates/

Biblioteca de plantillas del **Generador de contenido social** (admin de ebecerra).

Cada subcarpeta es una plantilla. El admin las lee al arrancar y ofrece una al usuario; el worker (GitHub Actions) las renderiza con Playwright.

## Estructura de una plantilla

```
social-templates/
  <slug>/
    meta.json       # Metadatos + schema de campos
    template.html   # HTML con placeholders {{name}} y bloques {{#each items}}…{{/each}}
    preview.png     # (opcional) miniatura para la UI
```

## Formato de `meta.json`

```json
{
  "id": "lista-negativa-4x5",
  "name": "Lista negativa (post 4:5)",
  "description": "Post oscuro con titular destacando una palabra y 4 ítems en lista.",
  "format": "post-4x5",
  "width": 1080,
  "height": 1350,
  "fields": [
    { "id": "kicker",         "type": "text",  "label": "Antetítulo (kicker)",    "maxLength": 40, "default": "// cómo trabajo" },
    { "id": "titleStart",     "type": "text",  "label": "Título — parte 1",       "maxLength": 30, "required": true },
    { "id": "titleEmphasis",  "type": "text",  "label": "Título — énfasis",       "maxLength": 10, "required": true },
    { "id": "titleEnd",       "type": "text",  "label": "Título — parte 2",       "maxLength": 30 },
    { "id": "items",          "type": "list",  "label": "Ítems (4)",              "minItems": 2, "maxItems": 6, "itemMaxLength": 60 },
    { "id": "handle",         "type": "text",  "label": "Handle al pie",          "maxLength": 30, "default": "ebecerra.es" }
  ]
}
```

### Tipos de campo soportados

- `text` — input de una línea
- `textarea` — input multi-línea
- `list` — array de strings (el form muestra N inputs)
- `image` — URL pública o referencia a Sanity (no usado en MVP)

### Placeholders en `template.html`

- `{{fieldId}}` — substituye con el valor (HTML-escapado por defecto)
- `{{{fieldId}}}` — substituye sin escapar (raw HTML, solo si confías en el campo)
- `{{#each fieldId}}…{{this}}…{{/each}}` — itera arrays. `{{this}}` es el item actual.
- `{{brand.primary}}`, `{{brand.bgColor}}`, `{{brand.logoUrl}}`, `{{brand.handle}}` — vienen automáticos desde el tenant

### Branding automático

El worker inyecta `<style>:root { --brand-*: ... }</style>` antes del `<body>` usando los tokens del tenant. El HTML solo tiene que usar `var(--brand-primary)`, etc.

Tokens disponibles:

| CSS var               | Origen en el tenant                |
|-----------------------|------------------------------------|
| `--brand-primary`     | `branding_color_primary`           |
| `--brand-bg`          | `branding_color_bg` (fallback `#0a0a0a`) |
| `--brand-fg`          | `branding_color_fg` (fallback `#fafaf9`) |
| `--brand-accent`      | `branding_color_accent`            |
| `--brand-logo-url`    | `branding_logo_url`                |

Si el tenant no tiene branding (job de operator), se usan los tokens por defecto de ebecerra.
