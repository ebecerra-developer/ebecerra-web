---
name: idea-lab
description: Fábrica iterativa de ideas de negocio y automatización (divergencia con lentes → crítica adversarial → ledger persistente). Úsala cuando Enrique pida "ideas para generar más ingresos/tráfico", "ideas de negocio", "qué automatizar", "sesión de ideas", o brainstorming de crecimiento/monetización/automatización. NO para ángulos o piezas de contenido social (eso es buscador-ideas-social).
---

# Idea Lab — fábrica de ideas de negocio y automatización

Pipeline divergencia→convergencia con subagentes paralelos, research web gateado, crítica adversarial y un ledger persistente: las ideas mejoran sesión a sesión y lo descartado no vuelve. Diseño contrastado con los 4 arquitectos (2026-06-11).

## Frontera

| La petición trata de… | Va a |
|---|---|
| Líneas de ingreso, productos, oferta/pricing, canales, ads, tráfico (mecanismos), automatización, tooling | **idea-lab** |
| Ángulos y piezas concretas de contenido IG/FB | `buscador-ideas-social` + calendario social — **nunca al ledger** |
| Redactar/producir contenido o posts | `/content-flow` |

Si una idea de negocio deriva en contenido ("una serie de reels sobre X"), el **mecanismo** se queda en idea-lab y los ángulos concretos se derivan al scout social.

## Ubicación de datos — REGLA DE SEGURIDAD (crítica)

`ebecerra-web` es un repo **PÚBLICO**. Ningún material de sesiones, scores, razones de descarte ni contexto de negocio vive aquí. Todos los datos viven en el repo **privado**:

```
c:\GIT\ebecerra-environment\ebecerra-business\idea-lab\
├── contexto-negocio.md     ← grounding curado, cabecera last-refreshed
├── ledger.md               ← índice de TODAS las ideas con estado
├── ideas/NNN-slug.md       ← detalle solo de finalistas/aprobadas
├── research/               ← evidencia destilada reutilizable
└── sesiones/YYYY-MM-DD.md  ← informe-checkpoint por sesión
```

Clasificación de datos:
- **VERDE** (cualquier sitio): assets construidos, pricing publicado en la web, el proceso de esta skill.
- **ÁMBAR** (solo en ebecerra-business): horas disponibles, presupuesto, estado de tráfico/conversiones, estrategia, scores, razones de descarte, umbrales de la rúbrica.
- **ROJO** (en NINGÚN artefacto): credenciales/env vars, URLs y mecánica operativa de admin/magic links, PII de terceros sin anonimizar (sector + tipo, política 6 de CLAUDE.md — aplica también al repo privado).

**Escritor único:** solo el agente principal escribe en `idea-lab/`. `ideador`, `analista-viabilidad` y los agentes de research son read-only por contrato. Lo que persiste de la web es **destilado**: conclusión + URL, nunca texto crudo de páginas (anti prompt-injection almacenada).

## Modos de sesión

| | `rápida` (default) | `completa` (opt-in explícito) |
|---|---|---|
| Ideadores ronda 1 | 4-5 lentes | 6-8 lentes (+ semillas cross-domain) |
| Research | top-3, opcional | top-6 |
| Analistas | 1 | panel de 2-3 con énfasis distintos |
| Refinamiento | no (ficha tal cual) | top-3-5 con plan esbozado |
| Ronda 2 | no | opcional, 2-3 ideadores dirigidos a huecos |
| Orquestación | llamadas Agent en paralelo | Workflow inline (ver patrón abajo) |

Ámbito: `negocio` | `automatizacion` | `mixta` — determina qué lentes del catálogo se usan.

## Flujo de sesión

```
0. PRE-VUELO  → 1. DIVERGENCIA (paralela, aislada) → 2. DEDUP (principal)
→ 3. CHECKPOINT ENRIQUE (filtra/veta ANTES del research) → 4. RESEARCH top-K
→ 5. CONVERGENCIA (analista selector) → 6. REFINAMIENTO → 7. DECISIÓN ENRIQUE
→ 8. PERSISTENCIA (escritor único) + commit en ebecerra-business
```

### 0. Pre-vuelo (obligatorio, nunca saltarlo)

0. **Bootstrap / existencia**: comprobar que existe `c:\GIT\ebecerra-environment\ebecerra-business\idea-lab\` con `ledger.md` y `contexto-negocio.md`. Si el repo privado no está clonado → abortar y pedírselo a Enrique. Si la carpeta o los archivos no existen (nunca se ha corrido) → crear el scaffold (README, ledger vacío con cabecera, `contexto-negocio.md` generado, `ideas/` y `sesiones/`) y saltar lint/decay/veto-list (no hay nada que parsear).
1. **Lint del ledger**: parsear `ledger.md`. "Parsea OK" = tabla de 7 columnas según la cabecera, todos los `Estado` y `Categoría` dentro de los enums cerrados, IDs únicos. Si NO parsea (columnas que no cuadran, estado/categoría fuera de enum, ID duplicado) → **abortar ruidosamente** y avisar (nunca continuar con dedup parcial). Archivo ausente ≠ corrupto: eso es el caso bootstrap (paso 0).
2. **Frescura del grounding**: si `last-refreshed` de `contexto-negocio.md` tiene >30 días → regenerarlo ANTES de divergir (fuentes: memoria del proyecto, CLAUDE.md, pricing actual —singleton `servicesPricing` en Sanity, o `apps/es/ebecerra-estrategia-precios.md` si existe—, calendario social, preguntas a Enrique si falta un dato clave). Grounding podrido = ideas malas con razonamiento confiado.
3. **Decay**: ideas en `nueva`/`aprobada` con último toque >6 semanas → el principal (escritor único) las marca `fría` en el ledger ya en el pre-vuelo, y en el checkpoint pregunta a Enrique si alguna revive. Una idea que lleva semanas sin que Enrique la pida es un rechazo implícito.
4. **Veto-list**: construir lista compacta de `descartada`/`vetada`/`fría` (1 línea: título — razón). Tope ~40 líneas; si excede, agrupar por patrón ("nada de X porque Y").

### 1. Divergencia

Lanzar N `ideador` **en paralelo en un solo mensaje** (Agent tool con `subagent_type: 'ideador'`; requiere que el agente esté cargado — ver nota al final), cada uno con: una lente del catálogo + su constraint + ruta de `contexto-negocio.md` + la veto-list + (lente contrarian) una semilla de dominio (el principal elige una del catálogo de la lente 7 a su criterio, distinta de las usadas en sesiones recientes según el ledger). **Aislados**: ningún ideador ve la salida de otro. **Una lente por ideador, nunca el mismo prompt dos veces.** Quórum: si responden ≥50%, la ronda sigue con los que haya (anotar lentes caídas en el informe).

Cuántas lentes: en `mixta` hay 11 disponibles → coge 6-8 (completa) o 4-5 (rápida) repartidas entre los dos ámbitos. En `automatizacion` puro solo hay 4 lentes (8-11): el tope real es 4; para "completa" añade 1-2 contrarian con semilla de un sector cuya automatización sea trasladable, en vez de repetir lente. En `negocio` puro hay 7 (1-7).

### 2-3. Dedup + checkpoint humano

El principal deduplica (semántico: variantes cosméticas = duplicado) contra la salida cruda y contra el ledger, y presenta a Enrique la lista compacta (título + 1 línea + lente). Enrique veta, marca favoritas y puede añadir ideas propias. **El research solo se gasta en lo que sobrevive a este filtro.**

Aprendizajes de la sesión inaugural (2026-06-11): (a) en checkpoints y decisión final, las ideas se explican **en texto plano conversacional** ("qué es, cómo se ve en tu día a día, qué cojea") — las opciones escuetas de un formulario no le bastan a Enrique para opinar; (b) preguntar SIEMPRE "¿qué has hecho ya tú sobre esto?" — puede estar ejecutando una variante mejor; (c) su filtro de identidad ("a medida, nunca plantillas/SKUs de cara al público") es más duro que el fit de marca genérico.

### 4. Research (top-K)

K≤6. Por idea: ≤3 búsquedas web. Regla dura: **sin fuente = hipótesis y se marca como tal** (la evidencia alucinada envenena el ledger para siempre). Cada idea sale con un **estado de evidencia** (`validada` / `sin-validar` / `contradicha`) que vive en la ficha y en su `ideas/NNN-slug.md` — NO es el `Estado` del ledger (ese sigue su propio enum: tras research la idea pasa a `investigada`, y el estado de evidencia se anota en la columna "Razón"). Si el research falla: 1 reintento y degradar a `sin-validar`, nunca bloquear la sesión. Consultar antes `research/` por si ya hay evidencia reutilizable.

### 5. Convergencia

`analista-viabilidad` recibe las fichas **sin autoría** (no decir qué lente generó qué) + el contexto. **El principal le inyecta en el prompt los anclajes numéricos de la rúbrica leídos de `contexto-negocio.md`** (las dimensiones 1-2 no se puntúan sin ellos — no inventar umbrales). Es **selector**: rankea y mata, jamás fusiona ideas en una "idea media". **Agregación**: no es media aritmética de las 5 dimensiones — el riesgo es una **puerta** (veto → fuera, sin importar el resto) y factibilidad ≤2 hunde la idea aunque el impacto sea alto; dentro de eso, ordena por juicio integrando impacto + time-to-señal + fit. En sesión completa, panel de 2-3 con énfasis distintos (p.ej. "euros primero", "horas primero", "marca primero"); el principal sintetiza los rankings sin promediar a ciegas. `<50%` de analistas responden → no juzgar: las ideas se quedan en `nueva` con "sin juzgar (analistas no respondieron)" en la columna Razón, y se dice en el informe.

### 6-8. Refinamiento, decisión y persistencia

Top-3-5 se refinan (plan esbozado, primer experimento, métrica de éxito y criterio de abandono). Enrique decide qué pasa a `aprobada`. El principal (único escritor) actualiza `ledger.md`, crea `ideas/NNN-slug.md` de las aprobadas/finalistas y cierra el informe de sesión. **El informe se escribe incrementalmente durante toda la sesión** (checkpoint por fase: si la sesión muere a mitad, lo hecho se recupera).

Plantilla de `ideas/NNN-slug.md`: la ficha NABC + estado de evidencia y fuentes (URLs) + el refinamiento (plan, primer experimento, métrica de éxito, criterio de abandono) + decisión de Enrique. Una idea = un archivo; el `ledger.md` solo lleva su línea-resumen.

**Antes del commit en ebecerra-business**: verificar (1) que el remoto de ebecerra-business sigue siendo privado, (2) que no se ha colado nada ROJO (credenciales, URLs operativas, PII de terceros sin anonimizar) en ledger/ideas/sesiones. Commit solo de `idea-lab/`, con el mensaje describiendo la sesión.

## Catálogo de lentes

Cada ideador recibe UNA lente. La persona se pasa rica y completa (no solo el nombre) + su constraint. Ámbito negocio:

1. **productizador** — Operador de SaaS bootstrapped obsesionado con vender lo ya construido. Mira los assets existentes (chatbot SaaS multi-tenant, reservas, admin panel, generador social, plantillas de demos, motor inmersivo, social-kit, blog) y pregunta: ¿quién pagaría por esto tal cual, empaquetado, sin construir apenas nada nuevo? *Constraint: ≥80% del trabajo ya está hecho.*
2. **empaquetador** — Consultor de pricing y ofertas para servicios productizados. No inventa producto: re-presenta la oferta actual — verticales por nicho, bundles, garantías, naming, anclas de precio, ofertas de entrada. *Constraint: cero desarrollo nuevo; solo cambiar cómo se vende lo que ya se vende.*
3. **growth-ig** — Growth lead de marcas personales B2B en español. Mecanismos de descubrimiento y conversión en IG: formatos con distribución inherente, colaboraciones, embudos comentario→DM→lead, lead magnets. NO piezas concretas (frontera con el scout social). *Constraint: cada idea explica POR QUÉ la vería gente nueva (el mecanismo de distribución), no solo qué se publica.*
4. **performance-ads** — Media buyer especialista en presupuestos micro. Captación de pago (Meta Ads u otros) con el presupuesto del contexto. *Constraint: cada idea lleva stop-loss y métrica de corte definidos desde el día 1.*
5. **ingresos-sin-cliente** — Solopreneur de productos digitales. Ingresos que no requieren cliente de servicios: plantillas, micro-SaaS, info-productos, licencias, afiliación. Conoce la fricción fiscal española (consultar `research/`). *Constraint: tiene que poder venderse mientras Enrique duerme, y la idea incluye su canal de distribución o no vale.*
6. **canales-alianzas** — Bizdev de agencia pequeña. Partnerships: gestorías, asesorías, fotógrafos, agencias saturadas (white-label), asociaciones de comerciantes, referidos de clientes. *Constraint: el partner gana algo claro y medible; si solo gana Enrique, descartada.*
7. **contrarian** — Forastero de otro sector (asignar semilla aleatoria: restauración, fitness, inmobiliario, educación, hotelería, juegos, artesanía…). Traduce un mecanismo que funciona en su sector al negocio de Enrique. *Constraint: la idea debe sonar rara a primera vista y defendible a la segunda.*

Ámbito automatización:

8. **fabrica-contenido** — Ingeniero de pipelines de contenido. Automatizar producción→programación→publicación IG/FB por vías 100% oficiales (Graph API, Meta Business Suite, n8n/Make, el social-kit y el generador social existentes). *Constraint: cero riesgo ToS — bots de engagement y mass DM están vetados de raíz; el engagement humano queda fuera del scope.*
9. **mejora-continua-webs** — SRE de webs de clientes. Loops automáticos: Lighthouse CI, auditorías SEO programadas, agentes que abren PRs de fixes mecánicos, monitorización, informes a cliente. *Constraint: revisión humana antes de cada merge, y la idea debe ser argumentable como valor que justifica la cuota mensual del cliente.*
10. **flujo-iteracion** — Tooling engineer de equipos humano-IA. Mejorar el flujo hasta demo/web viable: harness de testing más exigentes, specs ejecutables antes de codificar, design-review automatizado con criterios de Enrique codificados, loops agente-tester-agente. *Constraint: cada idea se mide en "nº de intervenciones manuales de Enrique ahorradas por iteración".*
11. **ops-negocio** — Operations manager de freelance. Automatizar lo no facturable: propuestas, onboarding, recordatorios, reporting a clientes, reseñas, seguimiento de leads. *Constraint: solo tareas que ya consumen tiempo real hoy (verificable en contexto/memoria), no problemas hipotéticos.*

## Ficha de idea (formato NABC, obligatorio)

Toda idea, en cualquier fase, es una ficha de **≤120 palabras** (acota el verbosity bias del juez):

```
### [título corto]
- Necesidad: quién tiene qué problema/deseo (real, no inventado)
- Aproximación: qué se haría, en 2-3 frases
- Beneficio: € y/o horas esperadas, con horizonte
- Competencia/alternativas: qué existe ya y por qué esto gana o convive
- Categoría: [ver categorías del ledger] · Esfuerzo: S/M/L · Primer experimento: [verificable en <2 semanas]
```

## Rúbrica del analista (5 dimensiones, 1-5 anclada)

Los **valores numéricos de los anclajes** (umbrales de €, horas) viven en `contexto-negocio.md` (ÁMBAR), no aquí. Dimensiones:

1. **Impacto-€ a 12 meses** — contra los umbrales del contexto; recurrente puntúa sobre puntual.
2. **Factibilidad real** — contra las horas disponibles del contexto. Penalizar con dureza la factibilidad vaga: "hacer marketing" no es un plan; sin primer experimento concreto, máximo 2.
3. **Time-to-first-señal** — cuánto tarda en dar la primera señal de demanda o el primer euro.
4. **Fit marca/posicionamiento** — PYME/autónomo, español de España, trato 1:1, "100% código tuyo". 5 lo refuerza, 1 lo contradice.
5. **Riesgo** — ToS/legal/RGPD/reputación/dependencia de canal.

**VETO duro (bloqueante, no un score):** riesgo de ban en IG (es el único canal que ha convertido — protegerlo), incumplimiento legal/RGPD, o daño reputacional. Una idea vetada queda `vetada` en el ledger; solo Enrique puede hacer override explícito.

## Ledger — formato y reglas

`ledger.md` es una tabla, una línea por idea:

```
| ID | Idea (1 línea) | Ámbito | Categoría | Estado | Razón / última decisión | Último toque |
```

- **ID**: secuencial `001`, `002`… nunca se reutiliza.
- **Categorías (cerradas, no inventar)**: `producto` · `oferta` · `trafico-organico` · `ads` · `ingresos-pasivos` · `alianzas` · `auto-contenido` · `auto-webs` · `auto-flujo` · `auto-ops` · `otros`.
- **Estados**: `nueva` → `investigada` → `aprobada` → `en-curso` → `hecha` | `descartada` (razón obligatoria) | `fría` (decay) | `vetada` (riesgo).
- La razón de descarte vale más que el título: es lo que permite generalizar "no más X" en la veto-list.
- **Umbral de archivado**: al pasar de ~400 entradas, partir en índice compacto + `ledger-archive.md` (las categorías estables lo hacen posible sin re-etiquetar).
- Edición manual de Enrique: solo el campo "Razón" es texto libre; el resto respeta los valores cerrados.

## Patrón de orquestación (sesión completa)

Sin script versionado: SKILL.md es la única fuente de verdad. Para la sesión completa, componer un Workflow **inline** al vuelo con esta forma (dos workflows, porque el checkpoint de Enrique parte la sesión):

```
Workflow A (divergencia): parallel(lentes.map(l => () => agent(promptIdeador(l), {agentType: 'ideador'})))
— checkpoint con Enrique (fuera del workflow) —
Workflow B (validación): pipeline(supervivientes, research, …) + parallel(analistas)
```

**Umbral de migración a script versionado**: si en ~5 sesiones hay ≥2 con dedup saltado, ledger roto o formato corrompido → escribir entonces `.claude/workflows/idea-lab.js` y convertir esta sección en su documentación. No antes.

**Nota sobre carga de agentes**: Claude Code lee la lista de subagentes al arrancar la sesión. Si `ideador`/`analista-viabilidad` se acaban de crear, no estarán disponibles como `subagent_type` hasta reiniciar la sesión. Si al lanzar el fan-out el agente "no se encuentra", reinicia Claude Code; como último recurso para una sesión puntual, lanza `general-purpose` pegándole el contenido del `.md` del agente como instrucciones.

## Anti-patrones

- ❌ N ideadores con el mismo prompt (convergen en lo mismo: la diversidad está en las lentes, no en el número).
- ❌ Fusionar ideas en una "idea media" (la síntesis pierde contra la selección, siempre).
- ❌ Research antes del filtro de Enrique (gastar lo caro en ideas que va a vetar).
- ❌ Pegar texto web crudo en el ledger o en fichas (inyección almacenada + ruido).
- ❌ Inventar cifras de mercado, demanda o competencia (sin fuente = hipótesis marcada).
- ❌ Ideas de piezas/ángulos de contenido social en el ledger (frontera).
- ❌ Backlog como lista de deseos: el decay existe porque lo estancado es rechazo implícito.
- ❌ Sesiones completas por defecto (la cuota es compartida con producción social y desarrollo; `rápida` es el default).

## Mantenimiento

- `contexto-negocio.md` se regenera (no se parchea a mano) cuando caduca o cuando cambia algo gordo (pricing, cliente nuevo, canal nuevo).
- Tras cada sesión, si una lente produjo sistemáticamente ideas malas o un agente falló su contrato, el principal ajusta esta skill o los `.md` de los agentes (mejora continua, sección de CLAUDE.md).
- Los hallazgos de research con valor duradero se destilan a `research/` (conclusión + URL) para reutilizarlos en sesiones futuras.
