# Estadísticas de anuncios

Almacén **local** de los exports de campañas (Meta Ads, Google Ads, GA4) y su
análisis. Es el bucle de feedback del contenido social: qué anuncio/creatividad
rinde → qué produzco después.

## ⚠️ Privado — no se sube a git

`ebecerra-web` es un repo **público**. Estos CSV llevan gasto, presupuesto, CPM,
ROAS… → se quedan **solo en local**. El `.gitignore` de `social-kit` excluye todo
lo que hay aquí **menos este README**:

```
estadisticas/*
!estadisticas/README.md
```

**Nunca** hacer `git add -f` de un archivo de esta carpeta. Si alguna vez quieres
versionar un análisis, que sea **sin cifras de gasto** (esas van a la memoria o al
repo privado `ebecerra-business/`).

## Qué guardar aquí

- Exports crudos de Meta Ads / Google Ads / GA4 (`.csv`, `.xlsx`).
- Nombre sugerido: tal cual lo exporta la plataforma, o `YYYY-MM-DD-fuente-tema.csv`.
- Opcional: subcarpetas `meta/`, `google/`, `ga4/` si crece.

## Dónde van los insights

Los aprendizajes destilados (qué formato gana en frío, coste por resultado, etc.)
se resumen en la memoria de Claude `project_ad_content_performance` para poder
consultarlos al planificar contenido, sin tener que releer los CSV.
