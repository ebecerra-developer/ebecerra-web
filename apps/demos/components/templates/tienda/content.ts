/* ==========================================================================
   Plantilla Tienda — contenido de chrome (supermercado FICTICIO: La Cesta)
   --------------------------------------------------------------------------
   Copy de la web (marca, nav, home, footer, labels de páginas). El CATÁLOGO va
   aparte en commerce/catalog.ts (forma Medusa). ES-only. Datos anonimizados
   (teléfono/WhatsApp/email de ejemplo, patrón de las demos).
   ========================================================================== */

export const tiendaContent = {
  brand: {
    name: "La Cesta",
    short: "La Cesta",
    monogram: "LC",
    claim: "Tu supermercado online",
    // Emblema (cesta) generado con IA de Sanity. El wordmark "La Cesta" va en
    // tipografía real al lado. Placeholder si algún día se quita: monogram.
    logoUrl:
      "https://cdn.sanity.io/images/gdtxcn4l/production/f55088c3ce81617fe0f61a2efe1b6d2020433890-1408x768.jpg?w=200&h=200&fit=crop&q=85&auto=format",
  },

  phone: { display: "+34 600 00 00 00", tel: "+34600000000" },
  whatsapp: { display: "WhatsApp", href: "https://wa.me/34600000000" },
  email: "hola@lacesta.example",
  address: "C/ del Mercado, 12 · Madrid",
  freeShippingCopy: "Envío gratis desde 30 €",

  nav: {
    skip: "Saltar al contenido",
    primaryNav: "Navegación principal",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    categoriesLabel: "Categorías",
    searchPlaceholder: "Busca productos, marcas y más…",
    searchLabel: "Buscar",
    cartLabel: "Cesta",
    accountLabel: "Mi cuenta",
    offersLabel: "Ofertas",
    ctaLabel: "Ver ofertas",
    allCategories: "Ver todas las categorías",
  },

  home: {
    hero: {
      badge: "Reparto en el día",
      title: "La compra de la semana, a un clic",
      sub: "Miles de productos frescos y de despensa, con reparto a domicilio en tu barrio. Pide antes de las 12:00 y lo tienes esta tarde.",
      ctaPrimary: "Empezar la compra",
      ctaSecondary: "Ver ofertas",
      stat1: "Envío gratis desde 30 €",
      stat2: "Paga al recibir",
    },
    trust: [
      { icon: "truck", title: "Reparto en el día", body: "Pide antes de las 12:00" },
      { icon: "leaf", title: "Producto fresco", body: "De la zona, cada día" },
      { icon: "card", title: "Paga al recibir", body: "Efectivo, tarjeta o Bizum" },
      { icon: "shield", title: "Compra segura", body: "Sin permanencia ni líos" },
    ],
    categories: { title: "Compra por categoría", cta: "Ver todo" },
    offersWeek: {
      title: "Ofertas de la semana",
      sub: "Precios especiales hasta el domingo",
      cta: "Ver todas las ofertas",
    },
    featured: { title: "Lo más vendido", sub: "Los favoritos de nuestros clientes", cta: "Ver más" },
    offersMonth: {
      title: "Ofertas del mes",
      sub: "Grandes precios todo el mes",
      cta: "Ver todas las ofertas",
    },
    recommended: { title: "Te puede interesar", sub: "Seleccionados para tu cesta", cta: "Ver más" },
    deliveryBand: {
      title: "Tu compra en la puerta, hoy mismo",
      body: "Elige tus productos, escoge la franja de reparto y paga cuando te llegue. Así de fácil.",
      cta: "Empezar a comprar",
      note: "Reparto gratis a partir de 30 € · 3,90 € por debajo, en tu barrio.",
    },
  },

  catalog: {
    addLabel: "Añadir",
    added: "Añadido",
    fromLabel: "desde",
    unitPer: "/ ",
    offerTag: "Oferta",
    outOfStock: "Agotado",
    perProduct: "productos",
  },

  category: {
    allTitle: "Todos los productos",
    offersTitle: "Ofertas",
    resultsLabel: "productos",
    sortLabel: "Ordenar por",
    sort: {
      relevance: "Relevancia",
      price_asc: "Precio: de menor a mayor",
      price_desc: "Precio: de mayor a menor",
      name: "Nombre (A–Z)",
      offers: "Ofertas primero",
    },
    filtersTitle: "Filtros",
    filterCategories: "Categorías",
    filterPrice: "Precio",
    filterOnlyOffers: "Solo ofertas",
    priceAny: "Cualquiera",
    priceUnder: "Hasta 2 €",
    priceMid: "2 € – 5 €",
    priceOver: "Más de 5 €",
    clearFilters: "Quitar filtros",
    empty: "No hemos encontrado productos con estos filtros.",
    applyFilters: "Ver resultados",
    openFilters: "Filtrar",
  },

  product: {
    back: "Volver",
    home: "Inicio",
    add: "Añadir a la cesta",
    quantity: "Cantidad",
    optionLabel: "Formato",
    ivaNote: "IVA incluido",
    unitLabel: "Precio",
    descriptionTitle: "Descripción",
    related: "Productos relacionados",
    inStock: "Disponible",
    offerSave: "Ahorras",
    freeShippingHint: "Envío gratis desde 30 €",
  },

  search: {
    title: "Búsqueda",
    resultsFor: "Resultados para",
    placeholder: "¿Qué estás buscando?",
    noResults: "No hemos encontrado nada para",
    noResultsHint: "Prueba con otra palabra o revisa las categorías.",
    resultsLabel: "productos",
  },

  cart: {
    title: "Tu cesta",
    pageTitle: "Tu cesta de la compra",
    empty: "Tu cesta está vacía.",
    emptyHint: "Añade productos y aparecerán aquí.",
    emptyCta: "Empezar la compra",
    subtotal: "Subtotal",
    shipping: "Reparto",
    shippingFree: "Gratis",
    total: "Total",
    checkout: "Tramitar pedido",
    continue: "Seguir comprando",
    remove: "Quitar",
    decrease: "Quitar uno",
    increase: "Añadir uno",
    close: "Cerrar cesta",
    ivaNote: "IVA incluido",
    itemsLabel: "productos",
    freeShippingHint: "Te faltan {amount} para el envío gratis.",
    freeShippingReached: "¡Tienes el envío gratis!",
    viewCart: "Ver la cesta",
  },

  checkout: {
    title: "Finalizar pedido",
    back: "Volver a la cesta",
    steps: "Datos · Reparto · Pago",
    summary: "Resumen del pedido",
    dataTitle: "Datos de reparto",
    fields: {
      firstName: "Nombre",
      lastName: "Apellidos",
      address: "Dirección (calle, número, piso)",
      city: "Localidad",
      postalCode: "Código postal",
      email: "Email",
      phone: "Teléfono",
      slot: "Franja de reparto",
      notes: "Notas para el repartidor (opcional)",
    },
    slots: [
      "Hoy, 17:00 – 19:00",
      "Hoy, 19:00 – 20:30",
      "Mañana, 10:00 – 12:00",
      "Mañana, 12:00 – 14:00",
    ],
    payTitle: "Método de pago",
    payCod: "Al recibir (efectivo / tarjeta / Bizum)",
    payCard: "Tarjeta ahora",
    payCardNote: "En una tienda real, aquí iría la pasarela segura (Stripe / Redsys).",
    submit: "Confirmar pedido",
    submitting: "Enviando…",
    demoNote: "Esto es una demo: no se cobra nada ni se envía ningún pedido de verdad.",
    requiredError: "Revisa los campos obligatorios.",
    successTitle: "¡Pedido confirmado!",
    successBody:
      "Hemos recibido tu pedido nº {order}. Te llegará en la franja elegida y pagas al recibir. (Es una demo: no hay cobro ni reparto reales.)",
    successCta: "Volver a la tienda",
    emptyRedirect: "Tu cesta está vacía.",
  },

  footer: {
    tagline: "Tu supermercado de barrio, ahora también online. Reparto a domicilio el mismo día.",
    columns: {
      shop: "Comprar",
      help: "Ayuda",
      company: "La Cesta",
    },
    helpLinks: ["Cómo funciona", "Zonas de reparto", "Preguntas frecuentes", "Contacto"],
    companyLinks: ["Sobre nosotros", "Trabaja con nosotros", "Nuestras tiendas"],
    legalLinks: ["Aviso legal", "Privacidad", "Condiciones de venta", "Cookies"],
    contactTitle: "Atención al cliente",
    hours: "Lun–Sáb, 9:00–20:30",
    demoDisclaimer:
      "Web de demostración de ebecerra.es. La Cesta es un supermercado ficticio; productos, precios y datos son de ejemplo.",
    rights: "Demo · ebecerra.es",
  },
} as const;

export type TiendaContent = typeof tiendaContent;
