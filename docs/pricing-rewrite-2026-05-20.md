# Reescritura de `servicesPricing` — 2026-05-20

## Contexto

Hoy el singleton `servicesPricing` en Sanity ([packages/sanity-schemas/schemas/servicesPricing.ts](../packages/sanity-schemas/schemas/servicesPricing.ts)) tiene **dos add-ons sueltos** mencionados (chatbot + reservas) y unas features por tier limitadas. La propuesta es **hacer visible todo lo que ya se puede entregar** (o se entrega con poco esfuerzo extra), de modo que el cliente perciba más valor por el mismo precio y entienda qué se lleva.

**Cero cambios de pricing.** Mismo precio, mismo trabajo. Solo cambia el copy y la cantidad de ítems anunciados por tier + el catálogo de add-ons.

**Workspace Sanity:** `ebecerra-web` (no `default`). Project: `gdtxcn4l`.

---

## Capacidades reales que se mencionan en la nueva oferta

Marcadas las que requieren construcción previa antes de poder comprometerse:

| Capacidad | Estado |
|---|---|
| Web Next.js custom multi-sección | ✅ ya se entrega |
| Diseño responsive móvil-first | ✅ ya se entrega |
| Formulario con Resend | ✅ ya se entrega |
| SEO técnico (meta, sitemap, robots, structured data) | ✅ ya se entrega |
| Asistente virtual (chatbot) con info cargada en Sanity | ✅ ya en producción |
| Sección FAQ estructurada (con búsqueda opcional) | ✅ implementable directo |
| Ficha Google Business optimizada | ✅ servicio puro, sin build |
| Widget de reseñas Google integrado | ⚠️ **falta construir** (1 tarde, ver § Construcción previa) |
| Sistema de reservas online | ⚠️ **falta integrar** (depende de proveedor: Calendly/Cal.com/custom) |
| Página SEO local por servicio | ✅ implementable directo |
| Blog editorial con artículos a medida | ✅ ya hay sistema completo de blog |
| Área cliente / sección privada con auth | ✅ se reusa el admin OAuth (apps/es) |
| Analytics + métricas | ✅ ya se usa Vercel Analytics |

**Construcción previa antes de publicar la nueva oferta:**

1. **Widget de Google Reviews integrable** — endpoint `/api/google-reviews` que tira de Google Places API (cache 24h), componente React `<GoogleReviewsWidget>` con la marca del sitio. ~1 tarde.
2. **Integración mínima de reservas** — decidir si se ofrece Cal.com embebido (rápido) o build propio (largo). Para el tier Avanzado, recomendado Cal.com embebido en V1, propio en V2.

---

## Estructura completa propuesta del singleton

### Sección hero (sin cambios obligatorios, opcionalmente refrescar copy)

| Campo | ES | EN |
|---|---|---|
| `kicker` | 02 · Servicios y precios | 02 · Services & pricing |
| `title` | Web profesional para tu negocio, paga como mejor te encaje | Professional web for your business, paid however suits you best |
| `lead` | Dos caminos, tres niveles. La web la haces conmigo, la pagas como prefieras. Todo lo que ves está incluido en el precio — sin sorpresas. | Two paths, three levels. We build the web together, you pay how you prefer. Everything you see is included — no surprises. |
| `pathSelectorLabel` | ¿Cómo prefieres pagarlo? | How do you prefer to pay? |

### Path 1 — Contrato

**`id`**: `contract`
**`isDefault`**: `true`
**`label`**: ES *"Cuota mensual"* / EN *"Monthly fee"*
**`tagline`**: ES *"Entras con menos inversión y el mantenimiento incluido."* / EN *"Lower upfront cost, ongoing maintenance included."*

#### Tier 1 — Esencial

| Campo | ES | EN |
|---|---|---|
| `id` | `esencial` | `esencial` |
| `name` | Esencial | Essential |
| `priceMain` | 399 € | €399 |
| `priceSecondary` | + 49 €/mes | + €49/month |
| `conditions` | Permanencia mínima: 12 meses | Minimum term: 12 months |
| `highlighted` | `false` | |

**Features** (lista, en orden):
1. ES *"Web profesional hasta 3 secciones (home + 2 páginas)"* / EN *"Professional web up to 3 sections (home + 2 pages)"*
2. ES *"Diseño responsive optimizado para móvil"* / EN *"Mobile-first responsive design"*
3. ES *"Formulario de contacto con notificaciones automáticas por email"* / EN *"Contact form with automatic email notifications"*
4. ES *"SEO técnico básico (meta, sitemap, datos estructurados)"* / EN *"Basic technical SEO (meta tags, sitemap, structured data)"*
5. ES *"Ficha de Google Business básica configurada"* / EN *"Basic Google Business profile setup"*
6. ES *"Hosting incluido en la cuota mensual"* / EN *"Hosting included in monthly fee"*
7. ES *"Mantenimiento de plataforma y actualizaciones de seguridad"* / EN *"Platform maintenance and security updates"*
8. ES *"Soporte por email"* / EN *"Email support"*

#### Tier 2 — Profesional

| Campo | ES | EN |
|---|---|---|
| `id` | `profesional` | `profesional` |
| `name` | Profesional | Professional |
| `priceMain` | 699 € | €699 |
| `priceSecondary` | + 69 €/mes | + €69/month |
| `conditions` | Permanencia mínima: 12 meses | Minimum term: 12 months |
| `highlighted` | `true` | |
| `badge` | ES *"el más contratado"* / EN *"most popular"* | |

**Features:**
1. ES *"Web profesional hasta 6 secciones"* / EN *"Professional web up to 6 sections"*
2. ES *"Diseño responsive optimizado para móvil"* / EN *"Mobile-first responsive design"*
3. ES *"Asistente virtual (chatbot) con la información de tu negocio"* / EN *"Virtual assistant (chatbot) loaded with your business info"*
4. ES *"Sección FAQ inteligente que reduce dudas frecuentes 24/7"* / EN *"Smart FAQ section that resolves frequent questions 24/7"*
5. ES *"Widget de reseñas de Google integrado en tu web"* / EN *"Google Reviews widget embedded in your site"*
6. ES *"Ficha de Google Business optimizada (fotos, descripción, horarios, servicios)"* / EN *"Optimized Google Business profile (photos, description, hours, services)"*
7. ES *"Formulario con notificaciones automáticas y respuesta auto-reply"* / EN *"Contact form with auto-reply and notifications"*
8. ES *"SEO técnico completo y datos estructurados (Rich Results)"* / EN *"Full technical SEO and structured data (Rich Results)"*
9. ES *"Hosting incluido en la cuota mensual"* / EN *"Hosting included in monthly fee"*
10. ES *"Mantenimiento, actualizaciones y soporte prioritario"* / EN *"Maintenance, updates and priority support"*

#### Tier 3 — Avanzado

| Campo | ES | EN |
|---|---|---|
| `id` | `avanzado` | `avanzado` |
| `name` | Avanzado | Advanced |
| `priceMain` | 999 € | €999 |
| `priceSecondary` | + 89 €/mes | + €89/month |
| `conditions` | Permanencia mínima: 12 meses | Minimum term: 12 months |
| `highlighted` | `false` | |

**Features:**
1. ES *"Web profesional sin límite de secciones"* / EN *"Professional web with unlimited sections"*
2. ES *"Diseño responsive optimizado para móvil"* / EN *"Mobile-first responsive design"*
3. ES *"Asistente virtual avanzado con personalidad y tono a medida"* / EN *"Advanced virtual assistant with custom personality and tone"*
4. ES *"FAQ inteligente con búsqueda integrada"* / EN *"Smart FAQ with integrated search"*
5. ES *"Widget de reseñas de Google integrado"* / EN *"Google Reviews widget embedded"*
6. ES *"Ficha de Google Business optimizada"* / EN *"Optimized Google Business profile"*
7. ES *"Sistema de reservas online integrado (calendario + confirmaciones automáticas)"* / EN *"Online booking system (calendar + automatic confirmations)"*
8. ES *"Páginas SEO local por servicio (hasta 3 incluidas)"* / EN *"Local SEO landing pages by service (up to 3 included)"*
9. ES *"Blog editorial con 3 primeros artículos redactados a medida"* / EN *"Editorial blog with first 3 custom-written articles"*
10. ES *"Analytics y panel de métricas con informe mensual"* / EN *"Analytics dashboard with monthly report"*
11. ES *"Hosting + dominio incluidos"* / EN *"Hosting + domain included"*
12. ES *"Mantenimiento, soporte prioritario y acompañamiento estratégico"* / EN *"Maintenance, priority support and strategic guidance"*

### Path 2 — Pago único

**`id`**: `oneTime`
**`isDefault`**: `false`
**`label`**: ES *"Pago único"* / EN *"One-time payment"*
**`tagline`**: ES *"Pagas una vez, la web es tuya."* / EN *"Pay once, the site is yours."*

#### Tier 1 — Esencial (mismo `id`: `esencial`)

- `priceMain`: `900 €` / `€900`
- `priceSecondary`: vacío
- `conditions`: ES *"Incluye 3 meses de soporte post-entrega"* / EN *"Includes 3 months of post-delivery support"*
- **Features**: mismas 8 que en Contrato Esencial, excepto:
  - Quitar: *"Hosting incluido en la cuota mensual"* y *"Mantenimiento de plataforma..."*
  - Añadir al final: ES *"Hosting y mantenimiento NO incluidos (te ayudo a contratarlos por tu cuenta)"* / EN *"Hosting and maintenance NOT included (I help you arrange them separately)"*

#### Tier 2 — Profesional (mismo `id`: `profesional`)

- `priceMain`: `1.500 €` / `€1,500`
- `priceSecondary`: vacío
- `conditions`: ES *"Incluye 3 meses de soporte post-entrega"* / EN *"Includes 3 months of post-delivery support"*
- `highlighted`: `true`
- `badge`: igual que Contrato
- **Features**: mismas 10 que en Contrato Profesional, excepto:
  - Sustituir *"Hosting incluido en la cuota mensual"* por *"Hosting y dominio: te ayudo a contratarlos"*
  - Sustituir *"Mantenimiento... soporte prioritario"* por *"3 meses de soporte post-entrega incluidos"*

#### Tier 3 — Avanzado (mismo `id`: `avanzado`)

- `priceMain`: `2.000 €` / `€2,000`
- `priceSecondary`: vacío
- `conditions`: ES *"Incluye 6 meses de soporte post-entrega"* / EN *"Includes 6 months of post-delivery support"*
- **Features**: mismas 12 que en Contrato Avanzado, excepto:
  - Sustituir *"Hosting + dominio incluidos"* por *"Hosting y dominio: te ayudo a contratarlos"*
  - Sustituir *"Mantenimiento, soporte prioritario y acompañamiento estratégico"* por *"6 meses de soporte post-entrega incluidos"*

### Cancellation clause (sin cambios)

Mantener tal cual está. Solo afecta a path `contract`.

### Add-ons section — **rebrand visual + catálogo ampliado**

| Campo | ES | EN |
|---|---|---|
| `addOnsSectionTitle` | Extras que puedes añadir | Extras you can add |
| `addOnsSectionLead` | Servicios adicionales que se contratan aparte y se pueden añadir a cualquier tier. | Additional services you can attach to any tier. |

**Lista de add-ons (`addOns[]`)**:

1. **Asistente virtual (chatbot) con tu información**
   - `price`: ES *"49 € setup + 9 €/mes"* / EN *"€49 setup + €9/month"*
   - `note`: ES *"Incluye redacción inicial de respuestas y carga del contexto desde tu información."* / EN *"Includes initial answers and context setup from your business info."*

2. **Sistema de reservas online**
   - `price`: ES *"199 € + 19 €/mes"* / EN *"€199 + €19/month"*
   - `note`: ES *"Calendario con horarios disponibles, confirmación automática y recordatorios por email."* / EN *"Calendar with available slots, automatic confirmation and email reminders."*

3. **Widget de reseñas de Google**
   - `price`: ES *"99 €"* / EN *"€99"*
   - `note`: ES *"Sección que tira de tus reseñas de Google y se actualiza sola. Sin tocar tu web actual si ya la tienes."* / EN *"Section pulling your Google reviews, auto-updated. No changes needed to your existing site."*

4. **Sección FAQ inteligente a medida**
   - `price`: ES *"79 €"* / EN *"€79"*
   - `note`: ES *"Hasta 12 preguntas frecuentes maquetadas con tu marca. Reduce dudas recurrentes por WhatsApp."* / EN *"Up to 12 FAQs styled with your brand. Reduces repetitive WhatsApp questions."*

5. **Ficha Google Business optimizada**
   - `price`: ES *"149 €"* / EN *"€149"*
   - `note`: ES *"Configuración completa: descripción, fotos, servicios, horarios, atributos. Sin SEO local en la web."* / EN *"Full setup: description, photos, services, hours, attributes. Does not include local SEO landing pages."*

6. **Página SEO local por servicio**
   - `price`: ES *"129 € cada una"* / EN *"€129 each"*
   - `note`: ES *"Landing optimizada para buscar 'servicio + barrio/ciudad' (ej. 'fisio suelo pélvico Moratalaz')."* / EN *"Landing optimized for 'service + neighborhood/city' searches."*

7. **Blog editorial (setup + 3 artículos a medida)**
   - `price`: ES *"249 € + 49 €/artículo adicional"* / EN *"€249 + €49 per additional article"*
   - `note`: ES *"Sistema completo de blog con tu marca y 3 primeros artículos redactados sobre temas que tú elijas."* / EN *"Full blog system with your brand and 3 custom-written articles on topics of your choice."*

### Migration footnote (sin cambios)

Mantener: *"\* 15 €/página, 25 €/blog entry"* o equivalente.

---

## Notas para quien lo aplique

1. **No subir precios**, solo cambiar copy. Misma economía, distinta percepción.
2. **Mantener `cancellationClause` y `migrationFootnote`** literalmente como estén. Ya están calibrados.
3. **Construir primero los dos ítems técnicos pendientes** (widget Google Reviews + decisión reservas) antes de publicar la nueva oferta, o asumir riesgo si entra una solicitud antes.
4. **Aplicación recomendada**:
   - Patch desde un nuevo agente con `mcp__sanity__patch_document_from_json` o desde Studio manualmente.
   - Hacer en una **draft** primero, revisar visual en `/preview` (Studio Presentation), aprobar y publicar.
5. **Workspace ebecerra-web**, dataset por confirmar (probablemente `production`). Si MCP da "Unauthorized organization access", aplicar via Studio + token `claude-mcp-write` que está en `apps/es/.env.local`.
6. **Tras aplicar, validar en `apps/es/sections/Services`** (o donde se consuma) que la query GROQ ya recupere las nuevas features sin cambios de schema (no hace falta — el schema soporta arrays variables).
