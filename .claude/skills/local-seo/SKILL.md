---
name: local-seo
description: Playbook de SEO local para ebecerra.es y webs de clientes — Google Business Profile, Bing Places, Apple Business Connect, reseñas, NAP, directorios y páginas de zona. Úsala cuando se hable de "SEO local", "ficha de Google / Google Business", "aparecer en el mapa", "Google Maps", "reseñas", "Bing Places", "Apple Maps", "listados/directorios", "diseño web [ciudad]" o cómo posicionar un negocio en búsquedas locales.
---

# SEO local — playbook

Cómo hacer que un negocio aparezca en búsquedas locales y mapas. Sirve para **ebecerra.es** y para **webs de clientes**. La palanca nº1 son las **reseñas**; el resto es consistencia + tiempo.

## Principio: el mapa es ranking, no magia
Aparecer al buscar tu **nombre exacto** = ficha existe/verificada. Aparecer para términos genéricos ("diseño web madrid") o al **navegar el mapa** = **ranking**, que depende de **reseñas + perfil completo + autoridad + tiempo**. Un negocio nuevo no rankea para genéricos de un día para otro — es carrera de fondo.

## Google Business Profile (lo primero y más importante)
- **Tipo de negocio:**
  - **Con local físico donde atiendes** → muestras dirección (sale pin fuerte en Maps).
  - **Sin local / remoto** → **negocio de área de servicio**: dirección **oculta** + defines zonas. Sigues apareciendo, pero **más flojo en el navegado del mapa** (los address-less rinden menos como pin). Trade-off real: mostrar el domicilio da pin pero expone tu casa.
  - *(ebecerra.es: área de servicio Madrid + Comunidad de Madrid + España; Enrique eligió mostrar dirección de Moratalaz para tener pin.)*
- **Optimización:** categoría primaria correcta + secundarias, descripción con keywords naturales, **servicios** listados, **fotos** (logo + portada + trabajo + cara), horario.
- **Reseñas ⭐ (factor nº1):**
  - Pídelas a clientes/conocidos reales. **NUNCA** con cuentas propias (Google detecta IP/dispositivo/cuenta vinculada → filtra o suspende).
  - Que cada uno la deje desde **su** conexión, **espaciadas** en días, **con texto** (las de solo-estrellas pesan menos).
  - **Responde a TODAS** (cuenta como señal de actividad + confianza). Varía el texto; en las sin-comentario, tu respuesta es el único texto → cuela ahí algo de tu actividad.
- **Publicaciones + Q&A:** publica de vez en cuando (reaprovecha redes); puedes **autorrellenar las FAQ** de la ficha.
- **Detección automática del píxel / "0% completado"**: si la web gatea el píxel por consentimiento, el robot de Google nunca lo detecta → es esperado, no un fallo.

## NAP consistente (clave en TODOS los listados)
Mismo **Nombre + dirección/zona + Teléfono + Web**, carácter por carácter, en todas partes. Es lo que cruzan los buscadores para fiarse. Cada listado bien hecho = **backlink/citación** que suma para Google y para las IA.

## Otros listados (mapas + citaciones)
- **Bing Places** (`bing.com/places`) → **importa desde Google Business** (atajo; hereda verificación). Cubre Bing + DuckDuckGo. Si das OAuth a Google, puede resync auto (revócalo después si quieres, o déjalo para que se actualice solo).
- **Bing Webmaster Tools** → el GSC de Bing; impórtalo desde Google Search Console. Bing alimenta Copilot/IA.
- **Apple Business Connect** (`businessconnect.apple.com`) → Apple Maps + Siri. Necesita Apple ID. ⚠️ Su **verificación de EMPRESA pide papeles fiscales** (declaración censal/licencia/CIF) → si el negocio no está dado de alta como autónomo/empresa, queda bloqueado (ver estado fiscal de Enrique en memoria).
- **Directorios de citación** (Páginas Amarillas, Cylex, Tuugo, Hotfrog, Infobel, locales) → backlinks/NAP, poco a poco.
- **Malt** → marketplace freelance corporativo; exige alta fiscal (entidad/epígrafe/IVA + NIF-IVA intracomunitario por ser francesa). No es canal prioritario para un persona-física no habitual.

## Páginas de zona en la propia web (mejor que dominios EMD)
Para captar "[servicio] [ciudad]" en orgánico:
- **NO comprar dominios EMD** (tipo `serviciociudad.es`). El boost EMD murió en 2012, los enlaces de dominios propios no pasan valor, y un sitio-señuelo que redirige = **doorway page** (penalizable). Un 301 desde un EMD nuevo = ~0 SEO (solo marketing/type-in).
- **SÍ: una página de zona DENTRO del dominio principal** (ej. `/diseno-web-madrid`):
  - Slug **ASCII** (sin ñ/tildes), keyword en title/H1/meta.
  - **Enlazada solo desde footer + sitemap, NUNCA en el nav/hero** → así no parece "solo trabajo en esa ciudad" y el **posicionamiento nacional queda intacto**. La home sigue nacional; la página de zona es un satélite de entrada desde Google.
  - Structured data útil: `Service` + `areaServed`/`City`, `FAQPage`, `BreadcrumbList`.
  - **No sprawl**: solo ciudades creíbles (donde hay presencia/sentido). Decenas de páginas de ciudades = thin/doorway.
  - *(ebecerra.es: `/diseno-web-madrid` ya en producción — ver memoria `project_landing_madrid_seo`.)*

## Landings de SECTOR (colección `sectorLanding`)
Mismo carril long-tail que las páginas de zona, pero por **sector** (gestorías, fisios…). A diferencia de la de Madrid (singleton `landingMadrid`), es una **colección** `sectorLanding`: cada sector = un doc en Sanity, **sin tocar código**. Ruta `/{pagina|diseno}-web-para-{sector}`, render con `apps/es/components/sections/SectorLanding.tsx` (PageHero + bloques + Contact embebido + JSON-LD `Service`+`FAQPage`). Solo footer (columna **"Especialidades"**) + sitemap, nunca nav/hero (posicionamiento nacional intacto). Añadir un sector = doc en Sanity + carpeta-ruta `page.tsx` (con `const SLUG`) + línea en `Footer.tsx` (`messages.footerLandings`) + sitemap.
- **Card directa a la demo del sector** (`featuredDemo`): objeto en el doc con `enabled` + `demoSlug` + `eyebrow` + `ctaLabel`. La card trae nombre/tagline/**miniatura** de la demo por slug (reusa `getPublishedDemoSites`, no hardcode) y enlaza a `demos.ebecerra.es/{slug}` (además del enlace genérico a `/ejemplos`). Se muestra como **mockup de ventana de navegador** con la captura del hero del demo. Gestorías → demo **Vega & Asociados** (`vega-asociados`).
- **Naming "página web" vs "diseño web":** para autónomos/PYMEs **no técnicos**, *"página web para {sector}"* casa mejor con cómo buscan ("diseño web" es jerga de proveedor). Google agrupa sinónimos → la misma página rankea para ambas; basta liderar con una en H1/title y que la otra aparezca natural en el cuerpo. Gestorías migrada de `diseno-web-para-gestorias` → `pagina-web-para-gestorias` (H1/metaTitle "Página web…"). **Al renombrar un slug ya vivo: 301 del viejo al nuevo** (proxy.ts / next.config redirects) + actualizar slug en Sanity + `SLUG` en page.tsx + footer + sitemap + canonical.

## Entidad / desambiguación (si hay homónimos)
En el JSON-LD del `Person`/negocio: `disambiguatingDescription`, `mainEntityOfPage` (→ la página "sobre"), `sameAs` (perfiles reales: LinkedIn, etc.). La entidad se refuerza con **menciones de terceros** (listados, prensa), no con dominios propios.

## Infra de medición
- **Google Search Console** + **Bing Webmaster** → indexación y por qué búsquedas apareces. Envía el sitemap.
- **TXT de verificación (GSC, dominio) NO se borran** → se revalidan; borrarlos = des-verificar.

## Expectativas (decirlas al cliente)
- Carrera de fondo: semanas/meses, no horas.
- Reseñas = lo que más acelera el ranking local.
- Para genéricos competidos ("diseño web madrid") tardas; primero sales en hiperlocal y según suben reseñas.

## Referencias del proyecto
Memorias: `project_local_seo_listings`, `project_landing_madrid_seo`, `project_meta_ads_setup`, `reference_email_config` (DNS en DonDominio), `user_sidegig_context` (estado fiscal → evitar plataformas que exijan alta). SOP de dominio/correo de cliente: `ebecerra-business/docs/sop-dominio-correo-cliente.md`. Skills relacionadas: `/seo-aeo-best-practices`, `/seo-audit`, `/ai-seo`, `/page-patterns`.
