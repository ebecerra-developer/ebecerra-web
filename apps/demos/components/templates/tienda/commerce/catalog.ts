/* ==========================================================================
   Plantilla Tienda — CATÁLOGO SEMILLA (supermercado FICTICIO: La Cesta)
   --------------------------------------------------------------------------
   Datos locales con la forma de `Product` de Medusa. Es la "base de datos" del
   MockCommerceAdapter. Precios IVA incluido (retail España). Ofertas modeladas
   con `original_amount` en la variante (compare-at, como Medusa). Destacados /
   recomendados / ofertas de la semana o del mes vía `tags` (product.tags[].value
   en Medusa). Imágenes en `images.ts` (handle → asset de Sanity). Todo
   placeholder, sustituible por el catálogo real de Medusa al migrar.
   ========================================================================== */

import type { Product, ProductCategory } from "./types";
import { PRODUCT_IMAGES } from "./images";

export const REGION = {
  id: "reg_es",
  name: "España",
  currency_code: "eur",
} as const;

export const FREE_SHIPPING_THRESHOLD = 30;
export const SHIPPING_FLAT = 3.9;

/** Iconos por categoría (nombres del set SVG, NO emojis). */
export const CATEGORY_ICON: Record<string, string> = {
  "frutas-verduras": "leaf",
  panaderia: "bread",
  lacteos: "milk",
  despensa: "can",
  bebidas: "bottle",
  hogar: "spray",
};

export const CATEGORIES: ProductCategory[] = [
  { id: "cat_frutas", name: "Frutas y verduras", handle: "frutas-verduras" },
  { id: "cat_panaderia", name: "Panadería", handle: "panaderia" },
  { id: "cat_lacteos", name: "Lácteos y huevos", handle: "lacteos" },
  { id: "cat_despensa", name: "Despensa", handle: "despensa" },
  { id: "cat_bebidas", name: "Bebidas", handle: "bebidas" },
  { id: "cat_hogar", name: "Limpieza y hogar", handle: "hogar" },
];

const CATEGORY_BY_HANDLE = new Map(CATEGORIES.map((c) => [c.handle, c]));

/** Etiquetas semánticas usadas en la home y filtros. */
export const TAG = {
  featured: "destacado",
  recommended: "recomendado",
  offerWeek: "oferta-semana",
  offerMonth: "oferta-mes",
} as const;

type SeedVariant = {
  title: string;
  amount: number;
  original?: number;
  stock?: number;
};
type SeedProduct = {
  handle: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  unit: string;
  tags?: string[];
  optionTitle?: string;
  variants: SeedVariant[];
};

const SEED: SeedProduct[] = [
  // ---------------- Frutas y verduras ----------------
  {
    handle: "platano-de-canarias",
    title: "Plátano de Canarias",
    description:
      "Plátano de Canarias IGP, dulce y con su punto de acidez. Madurado en la mata.",
    category: "frutas-verduras",
    unit: "al kg",
    tags: [TAG.recommended],
    variants: [{ title: "1 kg", amount: 1.95, stock: 80 }],
  },
  {
    handle: "tomate-rama",
    title: "Tomate en rama",
    description:
      "Tomate de rama recogido en su punto, con sabor y aroma. Para ensalada o sofrito.",
    category: "frutas-verduras",
    unit: "al kg",
    tags: [TAG.offerWeek],
    variants: [{ title: "1 kg", amount: 2.19, original: 2.99, stock: 60 }],
  },
  {
    handle: "aguacate-hass",
    title: "Aguacate Hass",
    description: "Cremoso y en su punto de maduración. Listo para tostada.",
    category: "frutas-verduras",
    unit: "ud.",
    variants: [{ title: "Unidad", amount: 0.95, stock: 90 }],
  },
  {
    handle: "naranja-de-mesa",
    title: "Naranja de mesa",
    subtitle: "De temporada",
    description:
      "Naranja de zumo, fina de piel y muy jugosa. Recogida esta semana.",
    category: "frutas-verduras",
    unit: "malla",
    tags: [TAG.recommended],
    optionTitle: "Formato",
    variants: [
      { title: "Malla 2 kg", amount: 3.2, stock: 40 },
      { title: "Caja 5 kg", amount: 7.5, stock: 15 },
    ],
  },
  {
    handle: "manzana-fuji",
    title: "Manzana Fuji",
    description: "Crujiente y dulce, ideal para comer al momento o merienda.",
    category: "frutas-verduras",
    unit: "al kg",
    variants: [{ title: "1 kg", amount: 2.1, stock: 55 }],
  },
  {
    handle: "patata-para-cocinar",
    title: "Patata",
    description: "Patata de temporada, buena para cocer, guisar y freír.",
    category: "frutas-verduras",
    unit: "bolsa",
    optionTitle: "Peso",
    variants: [
      { title: "2 kg", amount: 2.2, stock: 50 },
      { title: "5 kg", amount: 4.9, stock: 24 },
    ],
  },

  // ---------------- Panadería ----------------
  {
    handle: "pan-rustico",
    title: "Pan rústico",
    subtitle: "Horneado hoy",
    description:
      "Barra de masa madre con corteza crujiente y miga alveolada. Del horno de esta mañana.",
    category: "panaderia",
    unit: "ud.",
    tags: [TAG.featured],
    variants: [{ title: "Barra 400 g", amount: 0.95, stock: 40 }],
  },
  {
    handle: "croissant-mantequilla",
    title: "Croissant de mantequilla",
    description: "Hojaldrado, con mantequilla de verdad. Se nota al partirlo.",
    category: "panaderia",
    unit: "pack",
    variants: [{ title: "Pack 2 ud", amount: 1.8, stock: 30 }],
  },
  {
    handle: "pan-de-molde-integral",
    title: "Pan de molde integral",
    description: "100% harina integral, tierno y sin corteza. Para tostadas.",
    category: "panaderia",
    unit: "ud.",
    variants: [{ title: "460 g", amount: 1.65, stock: 35 }],
  },

  // ---------------- Lácteos y huevos ----------------
  {
    handle: "leche-entera",
    title: "Leche entera",
    description: "De granja de la zona, pasteurizada. Sabe a leche de verdad.",
    category: "lacteos",
    unit: "litro",
    tags: [TAG.recommended],
    optionTitle: "Formato",
    variants: [
      { title: "Botella 1 L", amount: 1.15, stock: 60 },
      { title: "Pack 6 × 1 L", amount: 6.3, stock: 25 },
    ],
  },
  {
    handle: "huevos-camperos",
    title: "Huevos camperos",
    description: "De gallinas en campo abierto (cat. 1). Yema firme y anaranjada.",
    category: "lacteos",
    unit: "docena",
    tags: [TAG.offerMonth],
    variants: [{ title: "Docena", amount: 2.95, original: 3.6, stock: 45 }],
  },
  {
    handle: "yogur-natural",
    title: "Yogur natural",
    description: "Cremoso y sin azúcares añadidos. Pack familiar.",
    category: "lacteos",
    unit: "pack",
    variants: [{ title: "Pack 4 ud", amount: 1.4, stock: 50 }],
  },
  {
    handle: "queso-semicurado",
    title: "Queso semicurado",
    description:
      "De mezcla, curación media. Suave al paladar. Cortado a la cuña.",
    category: "lacteos",
    unit: "cuña",
    tags: [TAG.featured],
    variants: [{ title: "Cuña 250 g", amount: 3.9, stock: 30 }],
  },

  // ---------------- Despensa ----------------
  {
    handle: "aceite-oliva-virgen-extra",
    title: "Aceite de oliva virgen extra",
    subtitle: "Cosecha temprana",
    description:
      "AOVE frutado con un punto de picor al final. Prensado en frío de la comarca.",
    category: "despensa",
    unit: "botella",
    tags: [TAG.featured, TAG.offerMonth],
    optionTitle: "Formato",
    variants: [
      { title: "1 L", amount: 8.9, original: 10.5, stock: 40 },
      { title: "Garrafa 5 L", amount: 39.5, original: 46.0, stock: 12 },
    ],
  },
  {
    handle: "espaguetis",
    title: "Espaguetis",
    description: "De sémola de trigo duro, quedan al dente. Los de siempre.",
    category: "despensa",
    unit: "paquete",
    variants: [{ title: "500 g", amount: 1.2, stock: 70 }],
  },
  {
    handle: "arroz-redondo",
    title: "Arroz redondo",
    description: "Grano redondo que absorbe bien el caldo. Para paella o al horno.",
    category: "despensa",
    unit: "paquete",
    optionTitle: "Formato",
    variants: [
      { title: "1 kg", amount: 1.45, stock: 70 },
      { title: "5 kg", amount: 6.6, stock: 18 },
    ],
  },
  {
    handle: "lentejas-pardinas",
    title: "Lentejas pardinas",
    description: "Lenteja pequeña y tersa que no se deshace en el guiso.",
    category: "despensa",
    unit: "paquete",
    tags: [TAG.recommended],
    variants: [{ title: "500 g", amount: 1.75, stock: 60 }],
  },
  {
    handle: "tomate-frito",
    title: "Tomate frito",
    subtitle: "Receta de la casa",
    description:
      "Sofrito a fuego lento con nuestro aceite, sin conservantes. Como el de casa.",
    category: "despensa",
    unit: "tarro",
    tags: [TAG.offerWeek],
    variants: [{ title: "Tarro 350 g", amount: 1.35, original: 1.79, stock: 55 }],
  },

  // ---------------- Bebidas ----------------
  {
    handle: "agua-mineral",
    title: "Agua mineral natural",
    description: "De manantial, mineralización débil. Pack para toda la semana.",
    category: "bebidas",
    unit: "pack",
    variants: [{ title: "Pack 6 × 1,5 L", amount: 2.4, stock: 80 }],
  },
  {
    handle: "zumo-de-naranja",
    title: "Zumo de naranja",
    description: "Exprimido, sin azúcares añadidos ni concentrado. Bien de vitamina C.",
    category: "bebidas",
    unit: "litro",
    tags: [TAG.recommended],
    variants: [{ title: "1 L", amount: 1.95, stock: 40 }],
  },
  {
    handle: "cerveza-lager",
    title: "Cerveza lager",
    description: "Rubia suave y refrescante. Pack para compartir.",
    category: "bebidas",
    unit: "pack",
    tags: [TAG.offerWeek],
    variants: [{ title: "Pack 6 × 33 cl", amount: 4.8, original: 5.9, stock: 40 }],
  },
  {
    handle: "vino-tinto-do",
    title: "Vino tinto D.O.",
    subtitle: "De la comarca",
    description: "Tempranillo joven, afrutado y fácil de beber. Para el diario.",
    category: "bebidas",
    unit: "botella",
    tags: [TAG.featured],
    variants: [{ title: "Botella 75 cl", amount: 4.9, stock: 30 }],
  },

  // ---------------- Limpieza y hogar ----------------
  {
    handle: "detergente-liquido",
    title: "Detergente líquido",
    description: "Para lavadora, eficaz en frío. Rinde 30 lavados.",
    category: "hogar",
    unit: "botella",
    tags: [TAG.offerMonth],
    variants: [{ title: "1,5 L", amount: 5.4, original: 6.8, stock: 25 }],
  },
  {
    handle: "papel-higienico",
    title: "Papel higiénico",
    description: "Doble capa, suave y resistente. Pack grande.",
    category: "hogar",
    unit: "pack",
    tags: [TAG.recommended],
    variants: [{ title: "12 rollos", amount: 4.2, stock: 40 }],
  },
  {
    handle: "lavavajillas-mano",
    title: "Lavavajillas a mano",
    description: "Concentrado, corta la grasa con poca cantidad. Aroma limón.",
    category: "hogar",
    unit: "botella",
    variants: [{ title: "750 ml", amount: 2.1, stock: 35 }],
  },
];

/** Construye los `Product` con forma Medusa a partir de la semilla. */
export const PRODUCTS: Product[] = SEED.map((s, pi) => {
  const category = CATEGORY_BY_HANDLE.get(s.category)!;
  const hasOptions = s.variants.length > 1 && !!s.optionTitle;
  const optionTitle = s.optionTitle ?? "Formato";

  const variants = s.variants.map((v, vi) => ({
    id: `variant_${pi}_${vi}`,
    title: v.title,
    sku: `${s.handle.toUpperCase().replace(/-/g, "").slice(0, 8)}-${vi + 1}`,
    calculated_price: {
      calculated_amount: v.amount,
      currency_code: "eur",
      original_amount: v.original,
    },
    inventory_quantity: v.stock ?? 25,
    options: hasOptions ? { [optionTitle]: v.title } : undefined,
  }));

  return {
    id: `prod_${pi}`,
    title: s.title,
    handle: s.handle,
    subtitle: s.subtitle ?? null,
    description: s.description,
    thumbnail: PRODUCT_IMAGES[s.handle] ?? null,
    images: PRODUCT_IMAGES[s.handle] ? [{ url: PRODUCT_IMAGES[s.handle] }] : [],
    options: hasOptions
      ? [
          {
            id: `opt_${pi}`,
            title: optionTitle,
            values: s.variants.map((v, vi) => ({
              id: `optval_${pi}_${vi}`,
              value: v.title,
            })),
          },
        ]
      : [],
    variants,
    categories: [category],
    tags: (s.tags ?? []).map((value) => ({ value })),
    unit: s.unit,
  };
});
