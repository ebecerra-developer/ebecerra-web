# Estadísticas de anuncios

Almacén **local** de los exports de campañas (Meta Ads, Google Ads, GA4) y su
análisis. Es el bucle de feedback del contenido social: qué anuncio/creatividad
rinde → qué produzco después.

## ⚠️ Privado — no se sube a git

`ebecerra-web` es un repo **público**. Estos CSV llevan gasto, presupuesto, CPM,
ROAS… → se quedan **solo en local**. El `.gitignore` de `social-kit` excluye todo
lo que hay aquí **menos este README**:

```gitignore
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

## Cómo estructurar para comparar las publicaciones

El export a nivel de *anuncio* solo distingue publicaciones si **cada publicación
es su propio anuncio con nombre propio**. Un anuncio "mix" (varias piezas juntas)
sale como una única fila y no se puede desglosar.

- **1 publicación = 1 anuncio.** Nómbralo claro: `Carrusel proceso web`,
  `Reel demos`, `Post relatable X`… ese nombre es lo que los diferencia en el CSV.
- **Duplicar, no editar.** Al probar otra pieza, **duplica** el anuncio y cambia la
  creatividad (creas uno nuevo). Si editas la creatividad de un anuncio existente,
  Meta resetea/mezcla su histórico y pierdes la comparación.
- **Un solo conjunto de anuncios** con los N anuncios dentro (con 4 €/día, separarlos
  en varios conjuntos = migajas por conjunto y no aprenden). Meta reparte el
  presupuesto hacia el que mejor va — dejas el ganador y metes retadores.
- **Exportar bien:** en Ads Manager, pestaña **Anuncios** (no Campaña ni Conjunto),
  con el rango de fechas → exportar. Sale **una fila por anuncio = por publicación**.

Qué mirar por publicación para decidir: **coste por resultado** (el más bajo gana),
**CTR de enlace** (>1% ya es bueno), **CPM**, y las **clasificaciones de calidad/
interacción/conversión** (subir de "Media" a "Por encima del promedio" abarata la entrega).

## Dónde van los insights

Los aprendizajes destilados (qué formato gana en frío, coste por resultado, etc.)
se resumen en la memoria de Claude `project_ad_content_performance` para poder
consultarlos al planificar contenido, sin tener que releer los CSV.
