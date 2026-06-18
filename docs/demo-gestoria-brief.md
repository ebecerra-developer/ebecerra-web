# Brief — Demo de gestoría para `apps/demos`

> Brief de diseño para construir una demo de gestoría (negocio ficticio) que Enrique enseñará a gestorías reales como ejemplo de "cómo podría quedar vuestra web". Pensado para llevarlo a otro chat y que un agente la construya. Es un punto de partida "a grandes rasgos", no un spec cerrado.

## 1. Objetivo y contexto

- **Para qué:** material de captación. En vez de "te hago una demo", Enrique enseña YA una demo de gestoría que impacte. Es la prueba viva de su trabajo en el outreach a gestorías (idea-lab 006).
- **Dónde vive:** nueva plantilla en `apps/demos` (sistema multi-plantilla, ver skill `/demos-template-system`). Tokens scopeados con `[data-template="gestoria"]`, componentes propios por plantilla, reutilizando solo lo no protagonista (form, drawer móvil, helpers).
- **Público de la gestoría (no de Enrique):** autónomos, pymes y particulares españoles, muchos no técnicos, que buscan gestoría desde el **móvil/Google** antes de pisar el despacho. Le van a confiar impuestos y papeleo → cada elemento responde a "¿puedo fiarme de esta gente con mi dinero?".
- **El reto / la gracia:** un sector percibido como aburrido y anticuado, con una web que **sorprende** ("ala, qué web más chula") PERO que se sigue sintiendo **seria y de fiar**. El contraste ES el gancho. Si un efecto resta credibilidad, fuera.

## 2. Concepto rector: el arco "del lío al orden"

Un hilo narrativo que recorre toda la página y da coherencia a los momentos wow (en vez de efectos sueltos):

**Caos de papeles (hero) → Tu gestión en 3 pasos (proceso) → Tranquilidad, "tú a lo tuyo" (cierre).**

Esto convierte la web en una historia con principio y final, no en una lista de secciones. Es lo que hace que se recuerde la demo entera.

Regla de oro **anti-casino**: todo movimiento debe servir a un mensaje racional (orden, plazos, ahorro de tiempo, rigor). En cuanto un efecto es decoración pura, se recorta. Máximo **2-3 momentos wow**; el resto, microinteracciones sutiles.

## 3. Identidad ficticia sugerida (todo editable)

- **Nombre (placeholder):** "Gestoría Vega & Asociados" o similar — un nombre sobrio con apellido, que suene a despacho español de toda la vida. NO usar las siglas "GA" como nombre (ver punto 4).
- **Paleta sobria "de fiar":** azul profundo/marino institucional como base (código cromático de banca/seguros → "serio y estable"), grises pizarra, mucho blanco, y **un** acento contenido (verde "al día/aprobado", o un toque burdeos/oro para prestigio). Evitar naranjas chillones, degradados estridentes, multicolor de startup.
- **Tipografía:** una **serif con autoridad** para titulares (transmite tradición y solvencia, el "despacho de toda la vida") + una **sans muy legible** para texto (Inter/Source Sans), porque el público incluye gente mayor. Legibilidad > moda. (Nota: en `apps/demos` cada plantilla carga sus fuentes con `next/font/google` en el layout; fisio ya usa serif+sans, sirve de referencia de cómo se cablea — pero con fuentes propias de gestoría, no las de fisio.)
- **Tono de copy:** claro, cercano y **reposado**. Nada de "¡REVOLUCIONA TU FISCALIDAD!". Sí: "Tus impuestos en orden, y tú durmiendo tranquilo." En confianza fiscal, la calma vende; el hype levanta sospechas. Tutear cercano-pero-formal (target autónomo/pyme).
- **Aire y orden:** mucho espacio en blanco, layout ordenado y simétrico, jerarquía clara. El orden visual = "estos llevan mis cuentas con el mismo orden". Iconografía de línea fina coherente, nada de clipart ni emojis.

## 4. El sello "GA" / colegiación — señal de confianza nº1

- **Qué es:** "GA" = **Gestores Administrativos**, emblema del *Colegio Oficial de Gestores Administrativos* (organizados por colegios provinciales bajo el Consejo General). Solo lo luce un gestor **colegiado** → es la credencial que separa al despacho serio del intrusismo. ([Consejo General](https://www.consejogestores.org/), [ICOGAM Madrid](https://www.gestoresmadrid.org/))
- **En la demo:** reservar un hueco visible (hero o banda de confianza) para "Sello de colegiado · Nº XXXX" como **placeholder claramente ficticio**. NO clonar el emblema oficial real (sería atribuir colegiación falsa a un negocio ficticio). La gestoría real que adopte la web pondrá el suyo verdadero.
- **Acompañar de otras credenciales placeholder** (editables, marcadas como "sustituir por las reales"): colaborador social de la AEAT, autorizado RED de la Seguridad Social, punto PAE/CIRCE, colegios (Economistas/REAF, Graduados Sociales). Son habilitaciones oficiales verificables que dan autoridad real.

## 5. Elementos imprescindibles (sí o sí)

### Confianza / credibilidad
- Sello de colegiado + nº (placeholder) y figuras profesionales por área (gestor colegiado, asesor fiscal, graduado social para lo laboral).
- Años de trayectoria ("desde 19XX") — en este sector la longevidad es prueba de solvencia.
- Datos fiscales completos (razón social, CIF, domicilio) en footer + aviso legal.
- **Aviso legal + Política de Privacidad + Cookies reales (RGPD/LSSI):** una gestoría que no cumple en su propia web pierde toda credibilidad (van a tratar nóminas, declaraciones, datos sensibles).
- Mención a confidencialidad/seguridad de datos.

### Servicios (en el idioma del cliente, no jerga)
- Cuatro áreas troncales bien separadas: **Fiscal** (IRPF, IVA mod. 303, Sociedades), **Laboral** (nóminas, contratos, Seg. Social), **Contable** (libros, cuentas anuales), **Mercantil/Jurídico** (constitución de SL, herencias).
- Bloque propio **"Autónomos"** (el grueso del mercado; hablar su día a día: alta 036/037, 303, 130, renta) y bloque **"Empresas/Pymes"** diferenciado (Sociedades mod. 200, cuentas anuales, nóminas de plantilla).
- Servicios de "momento vital" muy visibles: **herencias y sucesiones, extranjería (NIE, residencia), tráfico (transferencias, matriculaciones)** — búsquedas de alta intención, a menudo urgentes.
- Cada servicio descrito como problema resuelto ("Te llevamos la contabilidad para que no te juegues una sanción"), no como nombre técnico.
- Mención de digitalización / portal del cliente / firma electrónica → diferencia frente a la gestoría de "tráeme los papeles en una carpeta".

### Contacto y captación
- **Teléfono clicable sticky** (este sector se resuelve mucho por llamada) + **WhatsApp Business** (canal real del autónomo) + email con **dominio propio** (nunca gmail visible).
- Formulario corto (nombre, teléfono, "qué necesitas") con **casilla de consentimiento RGPD explícita**.
- CTA "primera consulta sin compromiso" (baja la barrera de cambiar de gestor, que da pereza).
- Dirección física + **mapa** + horario (el despacho físico = arraigo y solvencia). Mención de atención remota a toda España si aplica.

### Contenido que da seguridad
- **Equipo real con foto, nombre y rol** ("María — área laboral"). Es el mayor salto de confianza frente a la web fría típica, y justo lo que les falta a las gestorías reales.
- Sectores/perfiles que atienden ("hostelería, comercio, sanitarios, e-commerce…") → el "este entiende lo mío".
- Testimonios (con sector+ciudad mínimo) + **reseñas de Google** enlazadas (prueba social + SEO local).
- **FAQ de dudas reales:** "¿cuánto cuesta llevar un autónomo?", "¿os encargáis del cambio desde mi gestor actual?", "¿qué hago si me llega una notificación de Hacienda?". El "yo me encargo del traspaso" elimina la mayor fricción del sector.
- Opcional: 3-4 avisos de actualidad fiscal ("plazos renta 2025") → demuestra que están al día. (Un blog abandonado da peor señal que ninguno.)

## 6. Momentos wow (priorizados)

### Núcleo seguro (incluir sí o sí — alto impacto, bajo riesgo, rinden en móvil)
1. **"Tu gestión en 3 pasos" — timeline scroll-driven.** Una línea de proceso (1. Nos mandas tus papeles → 2. Lo revisamos → 3. Presentamos por ti) cuyo trazo se dibuja con el scroll, encendiendo cada paso. Es el "wow racional" ideal: clarifica el servicio y se ve moderno. En móvil, degradar a fade secuencial. *(SVG `stroke-dashoffset` + scroll-driven CSS.)*
2. **Contadores con count-up al entrar en viewport** ("+12 años", "340 autónomos", "0 sanciones de clientes"), con un subrayado a mano (rough-notation) al terminar. El número es serio; la animación dirige la mirada. *(IntersectionObserver — barato.)*
3. **Equipo en TiltCard** (tarjeta con tilt 3D leve ~6-8° al hover, off en táctil) con foto que pasa de formal a cercana + su especialidad. Humaniza con un efecto premium. *(TiltCard ya existe: `apps/demos/components/templates/expedicion/ExpedicionTiltCard.tsx`.)*
4. **Banda/marquee lento de sellos de confianza** (colegiado, AEAT telemática, RED, software contable) — movimiento = modernidad, contenido = autoridad. Pausar en hover, respetar reduced-motion. *(Ref: `tandem/TandemMarquee.tsx`.)*
5. **Contador "días hasta tu próximo vencimiento fiscal" en vivo** en el hero (cuenta atrás al próximo modelo trimestral/renta). WOW **útil**: demuestra que la gestoría piensa en tus plazos; urgencia legítima, no FOMO. *(JS de fechas — barato, cero peso móvil.)*

### Ambicioso (el arco narrativo — opcional, mayor coste)
6. **Hero "papeleo que se ordena solo"**: recibos y números en desorden que se **alinean y archivan** en una carpeta limpia al avanzar. Metáfora literal del servicio (del lío al orden). *Recomendación:* ejecutarlo como animación **ligera scroll-driven / CSS**, NO con el motor inmersivo POV de canvas de `expedicion` (ese es para turismo/aventura: demasiado caro, pesado en móvil y puede restar seriedad). Si se quiere el motor inmersivo, servir versión estática en móvil con `prefers-reduced-motion`.
7. **Cierre "tranquilidad"**: última sección que cierra el arco — el caos del hero ya resuelto, frase "Tú a lo tuyo. De Hacienda nos encargamos nosotros.", el contador de plazos ahora en verde "al día". Memorable, emocional, mensaje = puro alivio.

### Detalles sutiles (si dan tiempo)
- Cross-fade tonal suave entre secciones (claro/oficina → cálido/papel), vigilando contraste de texto.
- CTA con micro-magnetismo al cursor (<6px, off en táctil) + check dibujado a mano al enviar el form.
- Mini-simulador "¿cuánto te ahorras delegando?" (slider horas/mes → € y horas recuperadas, con "estimación orientativa" honesta).
- Subrayados rough-notation en 3-4 frases clave máximo (no abusar).

## 6 bis. Arquitectura: HÍBRIDO — home one-page con wow + subpáginas de servicio

**Decisión: home one-page potente (todo el wow y el arco narrativo) + un puñado de subpáginas de servicio detalladas.** Lo mejor de los dos mundos: la home impacta en 30 s de scroll, y las subpáginas hacen que el gestor **sienta reconocida su web real** ("esto es lo que yo tendría", no solo una página de efectos). Demuestra a la vez el factor wow y la profundidad de una web de pago (tier Profesional/Avanzado).

- **Home (one-page):** el arco caos→3 pasos→tranquilidad, los momentos wow y un **resumen** de cada área de servicio. Cada área enlaza a su subpágina. Es la pieza que "vende" en los primeros segundos.
- **Subpáginas de servicio (vitrina):** página de detalle por área, con el patrón real de una web de gestoría (hero de la página, qué incluye, a quién va, FAQ del área, CTA). Es lo que posicionaría en Google en la web real ("asesoría laboral Madrid", "herencias", "extranjería"…).

**Alcance acotado (clave para que sea construible, no eterno):** NO construir las 8 áreas completas. Hacer **2-3 subpáginas modelo muy bien rematadas** que demuestren el patrón, y el resto de servicios quedan enlazados desde la home (pueden caer en una de las existentes o marcarse "próximamente / replicable"). Recomendadas: **Autónomos** (el grueso del mercado, la home ya tira de ahí) + una de alta intención emocional (**Herencias** o **Extranjería**, búsquedas urgentes que convierten) + opcional una troncal (**Fiscal/Laboral**). Con 2-3 el gestor ya "ve su web"; las 8 completas serían repetitivas.

**Implicaciones:**
- **Nav con enlaces reales** a las subpáginas (no solo anclas de scroll en la home). Es parte del realismo de "web de gestoría de verdad". Mobile-first con hamburguesa (Regla 7).
- Las subpáginas pueden reutilizar el patrón **PageHero** de páginas secundarias (ver `/page-patterns` en apps/es), adaptado a los tokens de la plantilla gestoría.
- Demos llevan **noindex global** — las subpáginas también; el SEO real llega cuando el cliente contrate. Aquí solo demuestran la estructura.
- **Argumento de venta que habilita:** "la home que impacta + una página por servicio para que te encuentren en Google" = justo el tier Profesional/Avanzado. La demo enseña ambas cosas.

## 7. Estructura propuesta (home one-page + subpáginas)

1. **Hero** — titular reposado + sello colegiado + contador de vencimiento + CTA doble (llamar / WhatsApp). Animación "del lío al orden".
2. **Banda de confianza** — marquee de sellos/credenciales.
3. **Servicios** — 4 áreas troncales, con tabs o bloques Autónomos / Empresas / Trámites de momento vital.
4. **Cómo trabajamos** — timeline "tu gestión en 3 pasos".
5. **Equipo** — TiltCards con caras reales (placeholders).
6. **Confianza** — contadores + testimonios + reseñas Google + sectores que atienden.
7. **FAQ** — dudas reales (incluye "traspaso desde tu gestor actual").
8. **Contacto** — formulario corto + teléfono + WhatsApp + mapa + horario + datos fiscales.
9. **Cierre "tranquilidad"** + footer con legal completo (aviso legal, privacidad, cookies, CIF).

En la home, el bloque **3 (Servicios)** muestra cada área como tarjeta-resumen que **enlaza a su subpágina** (las 2-3 construidas llevan a su detalle; el resto pueden marcarse "próximamente"). El **nav** lleva enlaces reales a esas subpáginas + anclas de la home.

**Patrón de cada subpágina de servicio** (mismo esqueleto, contenido propio por área):
1. **PageHero** del área (kicker + H1 "Asesoría laboral" / "Herencias y sucesiones" + lead + breadcrumb a la home).
2. **Qué incluye** — lista concreta de trámites del área en idioma del cliente (p. ej. Laboral: nóminas, contratos, altas/bajas Seg. Social, despidos).
3. **A quién va / cuándo lo necesitas** — el "este es para mí" (sector o situación).
4. **Mini-proceso o plazos** del área si aplica (reutiliza el estilo del timeline de la home, más sobrio).
5. **FAQ del área** (2-4 dudas específicas).
6. **CTA** (consulta sin compromiso / WhatsApp) + enlace de vuelta a otros servicios.
Sobriedad de la home, un solo toque de motion ligero (no recargar las subpáginas — el wow vive en la home).

## 8. Notas técnicas (para quien la construya)

- **Routing del híbrido:** home en la plantilla one-page de siempre; subpáginas como ruta anidada bajo el slug de la demo (p. ej. `apps/demos/app/[locale]/[slug]/[servicio]/page.tsx` con `servicio` ∈ {autonomos, herencias, …}, o segmento equivalente). Mantener todo dentro de la plantilla `gestoria` y sus tokens. Verificar que el nav y los breadcrumbs resuelven bien las rutas con locale.

- **Sistema de plantillas:** seguir `/demos-template-system`. Añadir enum `gestoria` al schema `packages/sanity-schemas/schemas/demoSite.ts` + deploy; tokens nuevos en `packages/tokens/demos-gestoria.css` scopeados `[data-template="gestoria"]` (sustituir TODOS los tokens, no heredar de fisio); componentes propios en `apps/demos/components/templates/gestoria/`; rama en el switch de `apps/demos/app/[locale]/[slug]/page.tsx`.
- **Gotcha createPortal:** si reutilizas form de contacto o drawer móvil con portal, pasa `templateScope="gestoria"` o heredará los tokens de fisio.
- **Mobile-first (Regla 7):** diseñar ≤480px primero; validar ≤768px y ≥1024px. Las gestorías se buscan desde el móvil — una web lenta o rota en móvil es, para este target, la prueba de que "no se enteran de lo digital".
- **`prefers-reduced-motion`:** obligatorio en todos los efectos. Las ideas caras (6, motor inmersivo, parallax) necesitan degradación explícita; las baratas (1,2,3,5) son las que más convencen.
- **Rendimiento:** medir LCP. Un efecto bonito que rompe el móvil no vale para este público.
- **Honestidad (política de veracidad del proyecto):** TODO dato sensible va como **placeholder claramente sustituible** — nº de colegiado, sellos, RC, partnerships, cifras de "X sanciones evitadas", testimonios. En la demo son ejemplos; el argumento de venta a la gestoría real es justamente "esto, con tus datos reales". No atribuir credenciales falsas a un negocio ficticio.
- **Componentes reutilizables ya montados:** TiltCard (`expedicion/ExpedicionTiltCard.tsx`), Marquee (`tandem/TandemMarquee.tsx`), cross-fade de escenas y parallax (`expedicion/ExpedicionImmersiveStage.tsx`), contadores/pills (`coach-vibrant/VibrantStats.tsx`). Combinar, no reinventar.

## 9. Lo que NO hacer

- Nada de pop-ups agresivos, contadores de urgencia falsos, "ofertas" tipo e-commerce ni animaciones por todas partes: choca de frente con la confianza que busca quien va a manejar tu dinero.
- No clonar el emblema oficial del Colegio de Gestores como si la gestoría ficticia estuviera colegiada.
- No saturar de efectos: 2-3 wow, el resto sutil. Saturar es exactamente lo que dañaría la seriedad.
- No fotos de stock de "apretón de manos / monedas apiladas": gritan plantilla barata. Placeholders de foto real de despacho/equipo (aunque sean genéricos marcados como sustituibles).
- No jerga técnica de cara al cliente (ni en la demo ni, después, en la web real).
